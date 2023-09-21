# My Diary

## 開啟方法

以下每一個 block 都請從根目錄開始執行。

- Frontend

```
cd frontend && yarn
yarn start
```

- Backend

```
cd backend
touch .env
```

.env 內 MONGO_URL 設成你的 mongodb 資料庫，PORT 設為 8000。

若 PORT 設為非 8000 的數字，則前端各 file 中的 backend_url 必須更改。

```
cd backend && yarn
yarn start
```

## Features

- 點擊右上角 New，新增一個 Diary
- 可輸入 Title、Content、Tag、Mood 等
- 其中 Tag 與 Mood 使用已存在於其他篇的作為候選清單，也可以自己新增。輸入 / 清單選取想要的 tag 以後按下 Add tag/mood 就能新增。
- 按下 Save 可儲存並回到首頁。
- 首頁左上角可以 Tag 與 Mood，filter 出想要的 Diary，也能設定各篩選條件之間要以 and 還是 or 方式。
- 在首頁圖卡點擊任一 Diary 可進入檢視介面。
- 在檢視介面中按 Edit 可進入編輯介面。
- 編輯介面中可選擇取消、儲存、或是刪掉整篇 Diary。

## 進階要求

1. Filter: 首頁左上角可選擇想要的 Tag
2. 更改日記卡的日期: 在編輯介面中，點擊日期該欄會跳出選擇介面，沒有辦法自行輸入，因此也不會有不合法的情況出現。
3. 日記內可插入圖片。




