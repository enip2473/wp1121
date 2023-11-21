# 使用說明

## server

(From root)
```
cd server
cp .env.example .env
yarn
yarn dev
```

## web

(From root)
```
cd web
cp .env.example .env
```

在 .env 中的 POSTGRES_URL 填寫你的 db 網址。

```
yarn
yarn dev
```

## 功能

所有基本功能皆有完成。

新增：可透過輸入任意使用者名稱，新增與該使用者的聊天室。若聊天室已存在，則提示使用者「聊天室已存在」。

此功能的實作方式是，列出所有目前存在的使用者並從中選擇。因此需要創建兩個使用者後才能新增與對方的聊天室。

進階功能完成 1 ~ 3，其中已讀功能在訊息中以使用者頭貼呈現(類似 messenger)。



