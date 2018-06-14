
## 使い方

server.js を node で立ち上げてください。
デフォルトのポートは 8000 のはずです。

参考までに私のUbuntuでの環境構築。

```
$ sudo apt-get update
$ sudo apt-get install nodejs
$ sudo ln -s "$(which nodejs)" /usr/bin/node
$ sudo apt-get install npm
$ sudo npm install forever -g
$ forever start server.js
```

- nodejs: プログラミング言語とその環境
	- それをまず `node` コマンドに結び付ける
- npm: パッケージマネージャ
- forever: nodejs アプリをデーモン化し、死活監視とかする

## Tips

Nginx で環境を構築する際、

```
location /app/dt {
	proxy_pass http://127.0.0.1:8000;
}
```

のように書いてしまうと、パスがずれてしまい正しく動きません。

```
location ~ ^/app/dt($|/.*$) {
	proxy_pass http://127.0.0.1:8000$1;
}
```

のように書くことで、その問題を回避できます。

502 Bad Gateway が起こるなど、Nginx 周りが怪しい場合は、

```
tail /var/log/nginx/error.log
```

でエラーを確かめてみてください。

参考:

- [node.js - Serve Express.JS app from subfolder - Stack Overflow](http://stackoverflow.com/questions/22027622/serve-express-js-app-from-subfolder)