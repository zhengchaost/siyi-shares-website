# 肆意股份官网 — Cursor 开发交接文档

> **文档版本：** v1.0  
> **最后更新：** 2026-04-25  
> **适用对象：** 接管后续开发的 Cursor / 开发工程师  
> **项目状态：** 主站已上线，三大事业群独立页面及后台管理系统待开发

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [本地目录结构](#3-本地目录结构)
4. [设计规范](#4-设计规范)
5. [服务器架构与登录信息](#5-服务器架构与登录信息)
6. [域名链路](#6-域名链路)
7. [部署流程（每次更新必读）](#7-部署流程每次更新必读)
8. [ECS 上的文件结构](#8-ecs-上的文件结构)
9. [已上线功能清单](#9-已上线功能清单)
10. [待开发功能清单](#10-待开发功能清单)
11. [已知问题与注意事项](#11-已知问题与注意事项)
12. [图片资源说明](#12-图片资源说明)

---

## 1. 项目概述

**肆意股份（SEG / Siyi Shares）** 是一家福建头部地产 MCN 公司，旗下设三大事业群：

| 事业群 | 英文名 | 当前状态 | 路由 |
|---|---|---|---|
| 目标传达 | Target Convey | 已有独立页面 | `/target-convey.html` |
| 异外文化 | Yiwai Culture | 占位跳转 | `/unknow` |
| 超赞文旅 | Chaozan Travel | 未建 | 待定 |

**线上地址：** [https://cn.segxm.com](https://cn.segxm.com)  
**备用域名：** [https://china-seg.com](https://china-seg.com)（301 跳转至 cn.segxm.com）  
**公司联系电话：** 0592-5735983  
**公司地址：** 厦门市集美区集杏海堤路 102 号 401 室

---

## 2. 技术栈

### 前端

| 技术 | 版本 | 说明 |
|---|---|---|
| React | 19.2.1 | 核心框架 |
| TypeScript | 5.6.3 | 类型系统 |
| Tailwind CSS | 4.x | 样式框架（使用 OKLCH 色彩空间） |
| shadcn/ui | new-york 风格 | UI 组件库，路径 `@/components/ui/*` |
| Wouter | 3.x | 客户端路由（轻量替代 React Router） |
| Vite | 7.x | 构建工具 |
| pnpm | 10.4.1 | 包管理器（**不要用 npm 或 yarn**） |
| framer-motion | 12.x | 动画库 |
| lucide-react | 0.453.0 | 图标库 |

### 构建命令

```bash
# 进入项目目录
cd /home/ubuntu/siyi-shares-website

# 安装依赖（首次或 pnpm-lock.yaml 变化时）
pnpm install

# 本地开发（热更新，端口 3000）
pnpm run dev

# 生产构建（输出到 dist/public/）
pnpm run build

# TypeScript 类型检查
pnpm run check
```

---

## 3. 本地目录结构

项目根目录：`/home/ubuntu/siyi-shares-website/`

```
siyi-shares-website/
├── client/                        # 前端源码（Vite root）
│   ├── index.html                 # HTML 入口，含 favicon、Google Fonts CDN
│   └── src/
│       ├── main.tsx               # React 挂载入口
│       ├── App.tsx                # 路由配置（Wouter Switch/Route）
│       ├── index.css              # 全局样式 + CSS 变量（品牌色系）
│       ├── const.ts               # 前端常量
│       ├── pages/
│       │   ├── Home.tsx           # ★ 主页（所有板块均在此文件）
│       │   └── NotFound.tsx       # 404 页面
│       ├── components/
│       │   ├── ErrorBoundary.tsx  # 错误边界
│       │   └── ui/                # shadcn/ui 组件（勿手动修改）
│       ├── contexts/
│       │   └── ThemeContext.tsx   # 主题 Context（当前固定 light）
│       ├── hooks/
│       │   ├── useMobile.tsx      # 移动端检测
│       │   ├── useComposition.ts  # 输入法组合事件
│       │   └── usePersistFn.ts    # 持久化函数引用
│       └── lib/
│           └── utils.ts           # cn() 工具函数（clsx + tailwind-merge）
├── server/
│   └── index.ts                   # 极简 Express 服务（仅用于 SPA fallback）
├── shared/
│   └── const.ts                   # 前后端共用常量
├── dist/
│   └── public/                    # ★ 构建产物（部署时上传此目录内容）
│       ├── index.html
│       └── assets/
│           ├── index-[hash].js    # 主 JS bundle
│           └── index-[hash].css   # 主 CSS bundle
├── vite.config.ts                 # Vite 配置（alias、build outDir 等）
├── tsconfig.json                  # TypeScript 配置
├── components.json                # shadcn/ui 配置
├── package.json                   # 依赖与脚本
├── pnpm-lock.yaml                 # 锁定依赖版本（提交到 git）
└── ideas.md                       # 设计方案记录（建筑感排版风格）
```

> **注意：** 图片资源**不在**项目目录内，全部存放于 ECS 服务器的 `/var/www/cn.segxm.com/web/images/`，通过绝对路径 `/images/文件名` 引用。本地备份在 `/home/ubuntu/webdev-static-assets/`。

---

## 4. 设计规范

### 4.1 设计风格

**建筑感排版（Architectural Typography）**——精致、克制、高端。参考建筑事务所官网的排版美学，大量留白，衬线字体主导，绿色作为唯一强调色。

### 4.2 色彩体系

| 变量名 | Hex 值 | OKLCH 值 | 用途 |
|---|---|---|---|
| `--siyi-green`（品牌主色） | `#249477` | `oklch(0.565 0.126 168.5)` | 按钮、强调色、边框装饰 |
| `--siyi-green-dark` | `#2D5A4E` | `oklch(0.45 0.11 168.5)` | Hover 状态、深色背景 |
| `--siyi-green-light` | — | `oklch(0.92 0.04 168.5)` | 浅绿背景、accent |
| `--siyi-dark` | `#1A1A1A` | `oklch(0.14 0 0)` | 主文字、深色区块 |
| `--siyi-dark-2` | `#2D2D2D` | `oklch(0.22 0 0)` | 次级深色 |
| `--siyi-gray` | `#888888` | `oklch(0.55 0 0)` | 辅助文字 |
| `--siyi-light-gray` | `#F5F5F5` | `oklch(0.96 0 0)` | 次级背景 |
| 背景 | `#FFFFFF` | `oklch(1 0 0)` | 主背景（light 主题） |

> **Tailwind 4 重要提示：** `@theme inline` 块中必须使用 OKLCH 格式，不能使用 HSL。直接写 Hex 颜色时（如内联样式）可用 `#249477`，但 CSS 变量必须用 OKLCH。

### 4.3 字体系统

通过 `client/index.html` 中的 Google Fonts CDN 加载：

```html
<!-- 已在 index.html 中配置 -->
Noto Sans SC    → 正文、导航、按钮（sans-serif）
Noto Serif SC   → 所有标题 h1~h6（serif，font-weight: 700）
Space Grotesk   → 章节序号、英文标签（monospace 风格）
```

在 `index.css` 中的应用规则：

```css
body { font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
h1, h2, h3, h4, h5, h6 { font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif; }
.section-index { font-family: 'Space Grotesk', 'Courier New', monospace; }
```

### 4.4 主题配置

当前固定为 **light 主题**（`ThemeProvider defaultTheme="light"`），无需切换功能。如需添加暗色模式，在 `index.css` 中添加 `.dark {}` 变量块，并在 `App.tsx` 中开启 `switchable`。

### 4.5 常用 CSS 工具类

```css
.btn-siyi          /* 肆意绿品牌按钮 */
.section-index     /* 章节序号标签（如 "01 / ABOUT"）*/
.siyi-quote        /* 绿色左边框引用块 */
.fade-in-up        /* 滚动进入动画（配合 JS IntersectionObserver）*/
.fade-in-up.visible /* 动画触发状态 */
```

### 4.6 间距与圆角

- 圆角：`--radius: 0.25rem`（极小圆角，保持建筑感的棱角）
- 容器最大宽度：`1440px`，桌面端左右 padding `4rem`
- 不要使用大圆角（如 `rounded-2xl`、`rounded-full`）

---

## 5. 服务器架构与登录信息

### 5.1 架构总览

```
用户访问 china-seg.com
        ↓
Hostinger 服务器（立陶宛）
.htaccess 301 跳转
        ↓
cn.segxm.com（阿里云 ECS 杭州）
Nginx 443 SSL → /var/www/cn.segxm.com/web/
```

### 5.2 阿里云 ECS（主服务器）

| 项目 | 值 |
|---|---|
| 云服务商 | 阿里云（Alibaba Cloud） |
| 地域 | 华东 1（杭州） |
| 公网 IP | `121.196.174.145` |
| SSH 端口 | `22` |
| SSH 用户名 | `root` |
| 操作系统 | Ubuntu 24.04 LTS |
| SSH 私钥路径 | `/home/ubuntu/.ssh/china-seg.pem` |

**SSH 登录命令：**

```bash
ssh -i /home/ubuntu/.ssh/china-seg.pem \
    -o StrictHostKeyChecking=no \
    root@121.196.174.145
```

> **⚠️ 注意：** ECS SSH 连接偶尔不稳定，大文件（>100KB）传输不要用 `scp`，应使用 CDN 中转方案（见第 7 节部署流程）。

**阿里云控制台登录：**

| 项目 | 值 |
|---|---|
| 账号名 | 厦门肆意股份有限公司 |
| 密码 | `Yangyang499,.` |
| 控制台地址 | https://console.aliyun.com |

### 5.3 Hostinger 服务器（301 跳转服务器）

| 项目 | 值 |
|---|---|
| 云服务商 | Hostinger（立陶宛） |
| 公网 IP | `46.202.198.18` |
| SSH 端口 | `65002`（非标准端口） |
| SSH 用户名 | `u672106856` |
| SSH 私钥路径 | `/home/ubuntu/.ssh/hostinger_siyi` |
| 网站根目录 | `~/domains/china-seg.com/public_html/` |

**SSH 登录命令：**

```bash
ssh -i /home/ubuntu/.ssh/hostinger_siyi \
    -p 65002 \
    -o StrictHostKeyChecking=no \
    u672106856@46.202.198.18
```

> **此服务器仅做 301 跳转，不做任何开发。** 除非需要修改跳转规则，否则无需登录。

---

## 6. 域名链路

### 6.1 域名解析

| 域名 | 解析类型 | 目标 | 托管商 |
|---|---|---|---|
| `cn.segxm.com` | A 记录 | `121.196.174.145` | 阿里云 DNS |
| `china-seg.com` | A 记录 | `46.202.198.18` | Hostinger DNS |
| `www.china-seg.com` | A 记录 | `46.202.198.18` | Hostinger DNS |

### 6.2 301 跳转配置

Hostinger 服务器 `~/domains/china-seg.com/public_html/.htaccess` 内容：

```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?china-seg\.com$ [NC]
RewriteRule ^(.*)$ https://cn.segxm.com/$1 [R=301,L]
```

效果：`http(s)://china-seg.com/*` 和 `http(s)://www.china-seg.com/*` 全部 301 跳转到 `https://cn.segxm.com/`。

### 6.3 SSL 证书

- 证书类型：Let's Encrypt（免费，90 天自动续期）
- 证书路径（ECS）：`/etc/letsencrypt/live/cn.segxm.com/`
- 续期命令（ECS 上执行）：`certbot renew --nginx`
- 备案信息：`cn.segxm.com` 已完成 ICP 备案，主域名 `segxm.com`

### 6.4 Nginx 配置（ECS）

配置文件路径：`/etc/nginx/sites-available/cn.segxm.com`

```nginx
server {
    listen 80;
    server_name cn.segxm.com;
    return 301 https://cn.segxm.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cn.segxm.com;
    root /var/www/cn.segxm.com/web;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/cn.segxm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cn.segxm.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 预留：Payload CMS 后台（/admin 和 /api 代理到本地 3001 端口）
    location /admin {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # CMS 媒体文件（待 CMS 上线后使用）
    location /media {
        alias /opt/segxm-cms/media;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback（React 客户端路由必须）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    error_page 404 /index.html;
    access_log /var/log/nginx/cn.segxm.com.access.log;
    error_log /var/log/nginx/cn.segxm.com.error.log;
}
```

修改 Nginx 配置后，执行：

```bash
nginx -t && systemctl reload nginx
```

---

## 7. 部署流程（每次更新必读）

### 7.1 为什么不能直接 scp？

ECS SSH 连接不稳定，直接 `scp` 大文件（JS bundle 约 565KB）容易中断。**标准流程是通过公网 CDN 中转**。

### 7.2 标准部署步骤

**步骤一：本地构建**

```bash
cd /home/ubuntu/siyi-shares-website
pnpm run build
```

构建完成后，`dist/public/` 目录内容：

```
dist/public/
├── index.html          # 主 HTML（约 360KB，内联了所有图片引用）
└── assets/
    ├── index-[hash].js   # 主 JS bundle（约 565KB）
    └── index-[hash].css  # 主 CSS bundle（约 112KB）
```

> **注意：** 每次构建后 `[hash]` 会变化，部署时需确认新文件名。

**步骤二：上传到公网 CDN**

```bash
# 查看新文件名
ls dist/public/assets/

# 上传（替换 index-XXXXXX.js 为实际文件名）
manus-upload-file \
  dist/public/index.html \
  dist/public/assets/index-XXXXXX.js
```

命令输出示例：

```
[SUCCESS] index.html -> https://files.manuscdn.com/...WkJtsCOLRbyIwwHb.html
[SUCCESS] index-XXXXXX.js -> https://files.manuscdn.com/...zmhHIxdqByFCishZ.js
```

**步骤三：SSH 到 ECS，用 wget 下载**

```bash
ssh -i /home/ubuntu/.ssh/china-seg.pem \
    -o StrictHostKeyChecking=no \
    root@121.196.174.145 "
WEB=/var/www/cn.segxm.com/web
ASSETS=\$WEB/assets

# 下载新文件（替换 URL 和文件名）
wget -q 'https://files.manuscdn.com/...zmhHIxdqByFCishZ.js' \
     -O \$ASSETS/index-XXXXXX.js
wget -q 'https://files.manuscdn.com/...WkJtsCOLRbyIwwHb.html' \
     -O \$WEB/index.html

# 清理旧版本 JS（保留新文件）
cd \$ASSETS && ls | grep '\.js$' | grep -v 'index-XXXXXX' | xargs -r rm -f

echo '部署完成'
ls -lh \$ASSETS/
"
```

**步骤四：验证**

浏览器访问 [https://cn.segxm.com](https://cn.segxm.com)，强制刷新（Ctrl+Shift+R）确认更新生效。

### 7.3 CSS 文件更新

CSS 文件（`index-[hash].css`，约 112KB）同样需要更新时，流程相同：

```bash
manus-upload-file dist/public/assets/index-XXXXXX.css
# 然后 SSH 到 ECS wget 下载，并清理旧 CSS
```

### 7.4 上传新图片到 ECS

图片文件较小，可以直接通过 CDN 中转上传：

```bash
# 1. 上传到 CDN
manus-upload-file /path/to/new-image.jpg

# 2. SSH 到 ECS 下载到 images 目录
ssh -i /home/ubuntu/.ssh/china-seg.pem \
    -o StrictHostKeyChecking=no \
    root@121.196.174.145 \
    "wget -q 'https://CDN_URL' -O /var/www/cn.segxm.com/web/images/new-image.jpg"
```

---

## 8. ECS 上的文件结构

网站根目录：`/var/www/cn.segxm.com/web/`

```
/var/www/cn.segxm.com/web/
├── index.html                  # 主站 SPA 入口（React 构建产物）
├── favicon.ico                 # 绿色 SEG 图标（15KB）
├── apple-touch-icon.png        # iOS 主屏图标（15KB）
├── target-convey.html          # 目标传达事业群独立页面（纯 HTML，41KB）
├── case-detail.html            # 案例详情页（占位，6.4KB）
├── portfolio.html              # 作品集页（占位，6.8KB）
├── assets/
│   ├── index-XdxXJ7WS.js      # 当前主 JS bundle（565KB）
│   └── index-LAaVZh0R.css     # 当前主 CSS bundle（112KB）
└── images/                    # 所有图片资源（共 18 张，4.6MB）
    ├── siyi-contact-wechat-qr.png      # 微信联系二维码
    ├── siyi-group-photo-hd.webp        # 团队合照（高清）
    ├── siyi-icon.jpg                   # 公司图标
    ├── siyi-logo-white.webp            # 白色 Logo
    ├── siyi-mcn-dingshu-qr.png         # MCN 博主：顶墅 QR
    ├── siyi-mcn-haofang-qr.png         # MCN 博主：好房评测局 QR
    ├── siyi-mcn-neican-logo.png        # MCN 博主：内参 Logo
    ├── siyi-mcn-team-edited.png        # MCN 团队照（AI 抠图，2.5MB）
    ├── siyi-mcn-yangyang-qr.png        # MCN 博主：洋洋 QR
    ├── siyi-project-huandong.jpg       # 项目：环东
    ├── siyi-project-inipark.jpg        # 项目：园博苑 inipark
    ├── siyi-project-liuxia.jpg         # 项目：刘霞
    ├── siyi-project-wuyuanwan.webp     # 项目：五缘湾
    ├── siyi-project-zhangzhou.webp     # 项目：漳州
    ├── siyi-qr-seg-miniprogram.png     # SEG 小程序二维码
    ├── siyi-qr-yiwai.png               # 异外文化二维码
    ├── siyi-space-new.jpg              # 办公空间（实拍）
    └── siyi-space-rendered.jpg         # 办公空间（渲染图，664KB）
```

> **图片本地备份：** `/home/ubuntu/webdev-static-assets/`（Manus 沙盒内）

---

## 9. 已上线功能清单

### 主站首页（`/`）

`client/src/pages/Home.tsx` 是整个主站的核心文件，包含以下板块（按从上到下顺序）：

| 板块 | 内容 | 关键元素 |
|---|---|---|
| 导航栏（Navbar） | Logo + 导航链接 + 联系按钮 | 滚动后背景变白，毛玻璃效果 |
| Hero 区域 | 全屏背景图 + 品牌口号 | CloudFront 背景图，金色装饰线 |
| 数据成就（Stats） | 4 个核心数据（博主数、粉丝数等） | CountUp 动画 |
| 关于我们（About） | 公司简介 + 团队合照 | `/images/siyi-group-photo-hd.webp` |
| 三大事业群（Business） | 目标传达 / 异外文化 / 超赞文旅 | 卡片式，悬停动画 |
| 地产 MCN（MCN） | 博主矩阵展示 + 团队照 | 4 个博主 QR 码 |
| 项目案例（Projects） | 5 个项目图片展示 | 悬停遮罩 |
| 联系我们（Contact） | 电话 + 微信 QR + 地址 | `/images/siyi-contact-wechat-qr.png` |
| 页脚（Footer） | 版权信息 + 备案号 | 深绿色背景 |

### 目标传达独立页面（`/target-convey.html`）

纯 HTML 文件，**不经过 React 构建**，直接部署在 ECS 网站根目录。使用 CDN Tailwind CSS，风格与主站统一（Noto Serif SC 字体，#249477 品牌绿）。包含：Hero、数据统计、关于我们、服务项目、案例展示、合作伙伴、联系我们。

### 业务卡片链接配置

在 `Home.tsx` 的三大事业群板块中：

```tsx
// 目标传达 → 独立页面
href="/target-convey.html"

// 异外文化 → 占位（React 路由内的 404 页面）
href="https://cn.segxm.com/unknow"

// 超赞文旅 → 待开发
// 暂无链接
```

---

## 10. 待开发功能清单

### 优先级 P1：三大事业群独立页面

| 页面 | 参考 | 建议路径 | 说明 |
|---|---|---|---|
| 目标传达 | 已有 `/target-convey.html` | 保持现状或迁移到 React | 可直接优化现有 HTML |
| 异外文化 | 无 | `/yiwai.html` 或 React 路由 | 需从零开发 |
| 超赞文旅 | 无 | `/travel.html` 或 React 路由 | 需从零开发 |

**建议：** 新页面统一采用与 `target-convey.html` 相同的纯 HTML 方案（无需 React 构建），风格保持一致，部署简单。

### 优先级 P2：后台管理系统（CMS）

**需求：** 各事业群负责人可以自行上传作品、更新内容，无需每次找开发。

**推荐方案：Payload CMS**（Nginx 配置中已预留 `/admin` 和 `/api` 代理到 `localhost:3001`）

```
技术选型：Payload CMS 3.x（Node.js，自托管）
部署位置：ECS 同一台服务器，端口 3001
数据库：MongoDB 或 PostgreSQL（需在 ECS 上安装）
访问地址：https://cn.segxm.com/admin
```

安装参考：[Payload CMS 官方文档](https://payloadcms.com/docs)

### 优先级 P3：其他优化

- 移动端导航菜单（汉堡菜单）完善
- 图片懒加载优化（当前部分图片无 `loading="lazy"`）
- 页面 SEO meta 标签补全（各子页面的 title/description）
- 微信小程序跳转链接配置

---

## 11. 已知问题与注意事项

### 11.1 ECS SSH 连接不稳定

ECS 服务器 SSH 连接偶尔超时或中断，尤其是在传输大文件时。**解决方案：始终使用 CDN 中转**（见第 7 节），不要直接 `scp`。

如果 SSH 连接失败，可以：

1. 等待 1-2 分钟后重试
2. 登录阿里云控制台（https://console.aliyun.com），使用"远程连接"功能通过 VNC 访问 ECS

### 11.2 Tailwind CSS 4 的 OKLCH 要求

Tailwind 4 的 `@theme inline` 块中**不支持 HSL 格式**，必须使用 OKLCH。如果添加新颜色变量，请使用 OKLCH 格式。

转换工具：https://oklch.com/（输入 Hex，获取 OKLCH 值）

### 11.3 图片路径规则

所有图片使用**绝对路径**引用，格式为 `/images/文件名`。图片文件存放在 ECS 的 `/var/www/cn.segxm.com/web/images/` 目录，**不在 React 项目目录内**。

```tsx
// ✅ 正确
<img src="/images/siyi-group-photo-hd.webp" />

// ❌ 错误（图片不在 React 项目中）
import photo from './assets/siyi-group-photo-hd.webp'
```

### 11.4 JS bundle hash 变化

每次 `pnpm run build` 后，`index-[hash].js` 的 hash 值会变化。`index.html` 会自动引用新 hash，但 ECS 上的旧 JS 文件需要手动删除，否则会占用磁盘空间。

### 11.5 target-convey.html 是独立 HTML 文件

`/target-convey.html` 是一个独立的纯 HTML 文件，**不经过 Vite 构建**，直接部署在 ECS 网站根目录。修改此文件时，直接编辑 `/tmp/target-convey-new.html`（或本地备份），然后通过 CDN 中转上传到 ECS。

### 11.6 Hostinger 服务器上有旧版本文件

Hostinger 服务器 `public_html/` 目录中还保留着旧版本的 JS/CSS 文件（`index-KzjrsK5f.js`、`index-wVq2-owe.css`），但由于 .htaccess 已将所有请求 301 跳转到 `cn.segxm.com`，这些文件不会被访问，**无需处理**。

---

## 12. 图片资源说明

### 12.1 图片清单（ECS `/images/` 目录，共 18 张）

| 文件名 | 用途 | 大小 |
|---|---|---|
| `siyi-contact-wechat-qr.png` | 联系方式微信二维码 | 99KB |
| `siyi-group-photo-hd.webp` | 关于我们板块团队合照 | 349KB |
| `siyi-icon.jpg` | 公司图标 | 43KB |
| `siyi-logo-white.webp` | 导航栏白色 Logo | 17KB |
| `siyi-mcn-dingshu-qr.png` | MCN 博主"顶墅"账号二维码 | 61KB |
| `siyi-mcn-haofang-qr.png` | MCN 博主"好房评测局"二维码 | 51KB |
| `siyi-mcn-neican-logo.png` | MCN 博主"内参"Logo | 23KB |
| `siyi-mcn-team-edited.png` | MCN 团队照（AI 抠图去背景） | 2.5MB |
| `siyi-mcn-yangyang-qr.png` | MCN 博主"洋洋"二维码 | 64KB |
| `siyi-project-huandong.jpg` | 项目案例：环东 | 31KB |
| `siyi-project-inipark.jpg` | 项目案例：园博苑 inipark | 98KB |
| `siyi-project-liuxia.jpg` | 项目案例：刘霞 | 32KB |
| `siyi-project-wuyuanwan.webp` | 项目案例：五缘湾 | 111KB |
| `siyi-project-zhangzhou.webp` | 项目案例：漳州 | 274KB |
| `siyi-qr-seg-miniprogram.png` | SEG 小程序二维码 | 96KB |
| `siyi-qr-yiwai.png` | 异外文化二维码 | 32KB |
| `siyi-space-new.jpg` | 办公空间实拍 | 32KB |
| `siyi-space-rendered.jpg` | 办公空间渲染图 | 664KB |

### 12.2 Hero 背景图

主站 Hero 区域背景图使用 CloudFront CDN 链接（在 `Home.tsx` 顶部的常量中定义），不在 `/images/` 目录内：

```tsx
// Home.tsx 顶部
const HERO_BG = "https://d2x6fzjkq9ztbl.cloudfront.net/...";
```

### 12.3 本地备份

所有图片的原始文件备份在 Manus 沙盒的 `/home/ubuntu/webdev-static-assets/` 目录，文件名以 `siyi-` 开头。

---

## 附录：SSH 私钥文件

两个 SSH 私钥文件存放在 Manus 沙盒的 `/home/ubuntu/.ssh/` 目录：

| 文件名 | 对应服务器 | 权限要求 |
|---|---|---|
| `china-seg.pem` | 阿里云 ECS（121.196.174.145） | `chmod 600` |
| `hostinger_siyi` | Hostinger（46.202.198.18:65002） | `chmod 600` |

如果在新环境中使用，需要将这两个文件复制到 `~/.ssh/` 并设置正确权限：

```bash
chmod 600 ~/.ssh/china-seg.pem
chmod 600 ~/.ssh/hostinger_siyi
```

---

*文档由 Manus AI 整理，基于实际部署状态生成。如有疑问，请联系项目负责人。*
