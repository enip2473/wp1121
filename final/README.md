# Edushare

## 環境設定

```
cp .env.example .env
```

-   POSTGRES_URL

    取得一個空的 PostgreSQL 資料庫並將其網址填入。

    本專案使用與上課相同的 neon。

-   NEXTAUTH_URL

    預設為 http://localhost:3000，如有更改請自行設定為專案網址。

-   NEXTAUTH_SECRET

    英文 + 數字任意組合即可。建議可使用

    ```
    openssl rand -base64 32
    ```

    指令生成。

-   UPLOADTHING_SECRET

    我們使用了 Uploadthing 這個平台來上傳及儲存圖片。

    如要使用的話需要先到這個網站註冊並創建一個 App。

    https://uploadthing.com/

    創建完成後，在

    https://uploadthing.com/dashboard/YOUR_APP_ID/api-keys

    可生成 API KEY，將生成的 UPLOADTHING_SECRET 與 UPLOADTHING_APP_ID 填入即可。

    若需協助可 email: b10902086@ntu.edu.tw

-   UPLOADTHING_APP_ID

    同上

## 安裝所需 package

```
yarn
```

## 資料庫初始設定

```
yarn migrate
```

## 啟動專案

```
yarn dev
```

注意若使用 yarn build + yarn start 會讓 uploadthing 套件無法運作(因其在 build 環境下需要 callback url)。

## 每位組員負責項目

-   B10902103 毛翊蓁

1. 專案規劃與管理

    列出想要的功能及目標使用者，規劃並負責開發進度確認

2. 前端界面設計與撰寫

    使用 Next.js, Tailwind CSS 以及 Material UI 撰寫前端元件與頁面。

3. API 設計

    列出每一支 API 具體希望達成的功能、所需資料型態及回傳格式。

-   B10902086 曹宸睿

1. 資料庫表格設計與建立

    根據 API 之需求，設計資料庫每個表的格式。

2. 後端 API 撰寫

    使用 Next.js, Drizzle ORM, Zod 以及 NextAuth 撰寫後端 API，確保資料正確並回應前端要求。

3. 雲端服務串接

    串接 uploadthing 服務用以做圖片上傳，並將專案透過 vercel deploy 至網路上。

## 是否為之前作品/專題的延伸？

否

## 對於此課程的建議

對於後兩次作業取消感到可惜，覺得上課的內容離實際做出東西仍有一段距離，希望可以透過作業的引導，更加確實的吸收上課內容。
