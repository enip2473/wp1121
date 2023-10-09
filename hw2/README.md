# Homework 2 說明

## 使用方式

### frontend

```
cd frontend
cp .env.example .env
yarn
yarn dev
```

### backend

```
cd backend
cp .env.example .env
// 編輯 .env 填入你的 MONGO_URL
yarn
yarn start
```

若 port 有更改為非 8000 的數字則前端 .env 中的 port number 也須隨之更改。

## 功能

### 基本功能

- 首頁
    1. 標題
    2. 播放清單
    3. 「ADD」按鈕
    4. 「DELETE」按鈕

- 播放清單頁(點擊圖片可進入)
    1. 播放清單資訊：標題、敘述皆可透過按下 edit 編輯。
    2. 歌曲資訊： 各欄位點擊兩下即可編輯，歌曲新增至其他清單功能可透過按下 export 按鈕完成。
    3. RWD
    4. 「ADD」按鈕
    5. 「DELETE」按鈕
    6. 連結： 需以 https 開頭才可點擊，否則為一般文字。

### 進階功能

1. 使用者提示：可試著在 Add 歌曲 / list 時空下任何欄位。
2. 重複名稱檢測：新增播放清單、歌曲時，可試著輸入已存在的清單名稱，將會跳出錯誤。歌曲則是檢查同一清單內不可有兩首相同名稱歌曲。
3. 搜尋：在首頁中上方有搜尋功能，輸入關鍵字可尋找相對應之清單。
4. 沒做
5. 沒做