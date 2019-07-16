# personium-blank-app

React.jsを使用したPersoniumアプリを開発するためのテンプレートです。

## 手順

### 設定ファイルの更新

#### ビルド・デプロイ設定

`config.example.js` → `config.js` へリネームし、修正する

```js
module.exports = {
  personium: {
    CELL_NAME: '<CELL_NAME>',             // アプリセル名
    CELL_FQDN: '<CELL_FQDN>',             // アプリセル名.ユニットFQDN
    CELL_ADMIN: '<ADMIN_USERNAME>',       // rootユーザーID
    CELL_ADMIN_PASS: '<ADMIN_PASSWORD>',  // rootユーザーパスワード
  // 中略
  }
};
```

#### アプリセル設定

`src/assets/launch.example.json` → `src/assets/launch.json` へリネームし、修正する

```json
{
  "personal": {
    "web": "<CELL_FQDN>/__/front/app",    // アプリセルFQDNを埋める
    "android": "***:",
    "ios": "***;"
  }
}
```

#### ユーザーセル内アプリ設定①

`src/bar/00_meta/00_manifest.example.json` → `src/bar/00_meta/00_manifest.json` へリネームし、修正

```json
{
  "bar_version": "2",
  "box_version": "1",
  "default_path": "<DEFAULT_BOX_NAME>",   // ユーザーセル内で使用するbox名
  "schema": "<APP_CELL_FQDN>"             // アプリセルFQDNを埋める
}
```

#### ユーザーセル内アプリ設定②

`src/bar/00_meta/90_rootprops.example.xml` → `src/bar/00_meta/90_rootprops.xml` へリネーム

### ビルド

#### barファイルのビルド

ユーザーにインストールしてもらうbarファイルをビルドします。

```bash
npm run build-bar
```

`dist/{アプリセル名}.bar` というファイルが生成されていれば成功です。これをユーザーのセルでインストールします。

#### アプリのビルド

アプリのビルドは下記コマンドで実行します。

```bash
npm run build-app
```

ビルドしたものは `build` フォルダ配下に配置されます。

### デプロイ

#### ビルド生成物のアップロード

下記コマンドを実行することで先程のコマンドでビルドしたファイルをアップロードします。

```bash
npm run deploy
```

#### ACLの設定

ACLの設定は手動で行います。

1. `/__/front` の all に exec を付与する
1. Service `/__/front` 内のスクリプト `launghSPA.js` に ServicePath `app` という名前を付ける
![Service Configuration](docs/setting_acl/service.png)
1. hoge

#### アプリ情報の開示設定

下記4ファイルの all に read を付与する

- launch.json
- profile.json
- relations.json
- roles.json

## 実行

barをインストールしたユーザーのホームアプリからアイコンをクリックすると、
`src/app/frontend/index.js` に実装された下記コードが実行されます。

```es6
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <h1>Hello React!</h1>,
  document.getElementById('root')
);
```

![Launch App](docs/setting_acl/launch_app.png)
