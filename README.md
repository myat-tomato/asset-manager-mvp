# QRコード連携型デバイス貸出・返却管理システム 構築手順書

## 1. 概要

本手順書は、QRコード連携型デバイス貸出・返却管理システムのローカル開発環境構築、Google Apps Script / Google Spreadsheet 連携設定、ビルド、共用サーバーへの配置手順をまとめたものです。

本システムは、React + TypeScript + Vite で作成したフロントエンドと、Google Apps Script Web App、Google Spreadsheet を連携して動作します。

フェーズ1では独自バックエンドサーバーおよびDBは使用せず、Google Apps Script をサーバーレス処理、Google Spreadsheet をデータ保存先として利用します。

---

## 2. システム構成

```text
利用者
  ↓
スマートフォンブラウザ / PCブラウザ
  ↓
React + TypeScript フロントエンド
  ↓
Google Apps Script Web App
  ↓
Google Spreadsheet
```

### 主な利用技術

| 区分 | 使用技術 |
|---|---|
| フロントエンド | React, TypeScript |
| ビルドツール | Vite |
| ルーティング | react-router-dom |
| QRコード生成 | qrcode.react |
| QRコード読取 | html5-qrcode |
| 認証 | Google Identity Services |
| データ処理 | Google Apps Script |
| データ保存先 | Google Spreadsheet |
| デプロイ対象 | Vite build成果物 `dist/` |

---

## 3. 前提条件

### 3.1 ローカルPC

以下がインストールされていること。

- Node.js
- npm
- Google Chrome などのモダンブラウザ
- Git（ソース管理を行う場合）

Node.js は LTS 版を推奨します。

```bash
node -v
npm -v
```

### 3.2 Google関連

以下を準備しておきます。

- Googleアカウント
- Google Cloud の OAuth クライアントID
- Google Apps Script プロジェクト
- Google Spreadsheet
- Google Apps Script Web App URL

### 3.3 注意事項

- `.env` 系ファイルにはAPI URLやGoogle Client IDを記載するため、Gitへコミットしないでください。
- QRコード読取でカメラを使用する場合、スマートフォン実機ではHTTPS環境が必要です。
- ローカル環境では `http://localhost:5173` で動作確認できます。

---

## 4. ソース構成

現在の主なソース構成は以下の通りです。

```text
src/
├─ App.tsx
├─ main.tsx
├─ index.css
│
├─ components/
│  ├─ AuthGuard.tsx
│  ├─ DeviceHistoryTable.tsx
│  └─ EmployeeSearchSelect.tsx
│
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ DeviceListPage.tsx
│  ├─ DeviceDetailPage.tsx
│  ├─ DeviceQrPage.tsx
│  ├─ QrGeneratePage.tsx
│  ├─ QrScanPage.tsx
│  ├─ LoanPage.tsx
│  ├─ CompletePage.tsx
│  └─ DeviceHistoryPage.tsx
│
├─ services/
│  ├─ gasApi.ts
│  ├─ authService.ts
│  ├─ deviceService.ts
│  ├─ employeeService.ts
│  ├─ historyService.ts
│  └─ optionService.ts
│
├─ styles/
│  ├─ login.css
│  ├─ menu.css
│  ├─ device-list.css
│  ├─ device-detail.css
│  ├─ device-qr.css
│  ├─ qr-generate.css
│  ├─ qr-scan.css
│  ├─ loan.css
│  ├─ complete.css
│  └─ device-history.css
│
└─ types/
   └─ google.d.ts
```

---

## 5. ローカル環境構築手順

### 5.1 プロジェクト作成

既に `package.json` がある場合は、この手順は不要です。

`src/` のみが提供されている場合は、Vite の React + TypeScript プロジェクトを作成します。

```bash
npm create vite@latest asset-manager -- --template react-ts
cd asset-manager
npm install
```

その後、提供された `src/` フォルダで、作成された `src/` を置き換えます。

### 5.2 必要ライブラリの追加

```bash
npm install react-router-dom qrcode.react html5-qrcode
```

必要に応じて型定義を追加します。

```bash
npm install -D @types/react @types/react-dom
```

### 5.3 Googleログイン用スクリプトの追加

`LoginPage.tsx` では Google Identity Services を使用するため、`index.html` に以下のスクリプトを追加します。

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

例：

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Asset Manager</title>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 6. 環境変数設定

プロジェクト直下に `.env.local` を作成します。

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxx/exec
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
VITE_APP_BASE_URL=http://localhost:5173
```

### 各項目の説明

| 環境変数 | 説明 |
|---|---|
| `VITE_GAS_API_URL` | Google Apps Script Web App のURL |
| `VITE_GOOGLE_CLIENT_ID` | Google Cloudで作成したOAuthクライアントID |
| `VITE_APP_BASE_URL` | QRコードに埋め込むアプリのベースURL |

### 本番・共用サーバー用の例

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxx/exec
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
VITE_APP_BASE_URL=https://example.com/
```

サブディレクトリ配下に配置する場合は、以下のように配置先URLまで指定します。

```env
VITE_APP_BASE_URL=https://example.com/asset-manager/
```

---

## 7. Google OAuth 設定

Google Cloud Console で OAuth クライアントIDを作成します。

### 7.1 OAuthクライアントの種類

- アプリケーションの種類：ウェブアプリケーション

### 7.2 承認済みのJavaScript生成元

ローカル確認用：

```text
http://localhost:5173
```

共用サーバー用：

```text
https://example.com
```

サブディレクトリに配置する場合でも、生成元はドメイン単位で登録します。

```text
https://example.com
```

### 7.3 設定後の反映

作成されたクライアントIDを `.env.local` の `VITE_GOOGLE_CLIENT_ID` に設定します。

---

## 8. Google Spreadsheet 準備

Google Spreadsheet に、GAS実装で参照するシートを準備します。

設計上の基本シートは以下です。

| シート名 | 用途 |
|---|---|
| DEVICE一覧 | デバイス情報を保存する |
| 社員名簿 | 社員一覧・社員検索用データを保存する |
| 更新履歴 | デバイス更新履歴を保存する |
| 選択肢マスター | 上位項目の選択内容に応じて、選択肢を絞り込むため |

### 8.1 デバイス管理データ項目

現在のフロントエンドでは、主に以下の項目を使用します。

| 項目 | 内容 |
|---|---|
| `deviceNo` | デバイス番号 |
| `deviceName` | デバイス名 |
| `status` | 状況 |
| `classification` | 分類 |
| `purpose` | 用途 |
| `category` | 区分 |
| `currentUser` | 現在使用者 |
| `employmentStatus` | 在職/退職などの雇用状態 |
| `previousUser` | 以前使用者 |
| `location` | 場所 |
| `condition` | 状態 |
| `notes` | 備考 |
| `loanDate` | 貸出日 |
| `loanSlip` | 借用書情報 |
| `manufacturer` | メーカー |
| `modelName` | 機種名 |
| `cpu` | CPU |
| `ram` | RAM |
| `purchaseDate` | 購入日 |
| `osName` | OS |
| `osLicense` | OSライセンス |
| `backupImageDate` | バックアップイメージ日 |
| `loginAccount` | ログインアカウント |
| `officeLicense` | Officeライセンス |
| `ip` | IPアドレス |

### 8.2 社員マスター項目

社員検索では、主に以下の項目を使用します。

| 項目 | 内容 |
|---|---|
| `employeeNo` | 社員番号 |
| `name` | 社員名 |
| `position` | 所属・役職など |
| `displayName` | 画面表示名 |
| `koreanName` | 韓国語名 |
| `englishName` | 英語名 |
| `furigana` | ふりがな |
| `status` | 在職状態 |
| `nationality` | 国籍 |
| `startDate` | 入社日 |
| `endDate` | 退職日 |

### 8.3 更新履歴項目

更新履歴では、主に以下の項目を使用します。

| 項目 | 内容 |
|---|---|
| `deviceNo` | 対象デバイス番号 |
| `updatedAt` | 更新日時 |
| `updatedBy` | 更新者 |
| `changes` | 変更内容のJSON文字列 |

`changes` は以下のようなJSON形式を想定します。

```json
{
  "status": {
    "before": "2未使用",
    "after": "1使用中"
  },
  "classification": {
    "before": "4社内開発",
    "after": "2現場貸出"
  }
}
```

---

## 9. Google Apps Script 準備

### 9.1 GAS側で必要な処理

フロントエンドからは、`action` 値に応じてGAS側の処理を呼び出します。

現在のフロントエンドで使用している主な `action` は以下です。

| action | 内容 |
|---|---|
| `verifyLogin` | GoogleログインIDトークンの確認 |
| `getDeviceList` | デバイス一覧取得 |
| `getDeviceByNo` | デバイス番号による詳細取得 |
| `createDevice` | 新規デバイス登録 |
| `updateDevice` | デバイス情報更新 |
| `getEmployeeList` | 社員一覧取得 |
| `getDeviceOptions` | 状況・分類・場所・用途・区分などの選択肢取得 |
| `getDeviceHistory` | デバイス更新履歴取得 |

### 9.2 リクエスト形式

フロントエンドは、GAS Web App に対して `POST` リクエストを送信します。

```json
{
  "action": "getDeviceByNo",
  "payload": {
    "deviceNo": "110"
  },
  "idToken": "Google ID Token"
}
```

### 9.3 レスポンス形式

成功時：

```json
{
  "success": true,
  "data": {}
}
```

失敗時：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### 9.4 GAS Web App デプロイ

Google Apps Script の画面で以下を実施します。

1. Apps Script プロジェクトを開く
2. `デプロイ` → `新しいデプロイ` を選択
3. 種類で `ウェブアプリ` を選択
4. 実行ユーザーを設定
5. アクセスできるユーザーを設定
6. デプロイ後に発行される Web App URL をコピー
7. `.env.local` の `VITE_GAS_API_URL` に設定

設定例：

| 項目 | 設定例 |
|---|---|
| 種類 | ウェブアプリ |
| 実行ユーザー | 自分 |
| アクセスできるユーザー | 組織内ユーザー、または動作確認用の許可ユーザー |

アクセス範囲は、社内運用方針に合わせて制限してください。

---

## 10. ローカル起動手順

以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下へアクセスします。

```text
http://localhost:5173
```

初回アクセス時はログイン画面へ遷移します。

---

## 11. QRコードURL仕様

QRコードには、以下の形式のURLを埋め込みます。

```text
{VITE_APP_BASE_URL}/?deviceNo={DEVICE番号}
```

例：

```text
https://example.com/?deviceNo=110
```

アプリ起動時、URLパラメータ `deviceNo` が存在する場合は、以下の詳細画面へ自動遷移します。

```text
/device/{DEVICE番号}
```

QRコードが本番URLではなくローカルURLを指してしまう場合は、ビルド前の `VITE_APP_BASE_URL` を確認してください。

---

## 12. 動作確認項目

構築後、以下を確認します。

| No | 確認内容 | 期待結果 |
|---|---|---|
| 1 | ログイン画面を表示 | Googleログインボタンが表示される |
| 2 | Googleログイン | ログイン後、メニュー画面へ遷移する |
| 3 | DEVICE一覧表示 | Spreadsheetのデータが一覧表示される |
| 4 | DEVICE検索 | 番号、名称、使用者などで絞り込みできる |
| 5 | DEVICE詳細表示 | 対象デバイスの情報が表示される |
| 6 | DEVICE情報更新 | 入力内容がSpreadsheetへ反映される |
| 7 | 分類が貸出の場合 | 借用書出力画面へ遷移する |
| 8 | 借用書出力 | 印刷またはPDF保存後に更新確定できる |
| 9 | 更新履歴 | 更新内容が履歴として表示される |
| 10 | QR表示 | 対象デバイスのQRコードが表示される |
| 11 | QR保存 | PNG保存ができる |
| 12 | QR読取 | カメラでQRコードを読み取り、詳細画面へ遷移する |
| 13 | ログアウト | セッション情報が削除され、ログイン画面へ戻る |
| 14 | 直接URLアクセス | 未ログイン時はログイン画面へ遷移し、ログイン後に元画面へ戻る |

---

## 13. セキュリティ・運用上の注意

- 実データを利用する場合は、SpreadsheetとGASのアクセス権限を社内ルールに合わせて制限します。
- Google IDトークンはGAS側でも検証します。
- `.env.local` はGit管理対象から除外します。
- 更新処理では、更新者、更新日時、変更内容を更新履歴として保存します。

---

# 本手順書は、MVP版（フェーズ1）を対象とした構築手順です