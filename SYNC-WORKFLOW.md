# 三端同步工作流

该工作流用于同步以下三端内容：

- 本地构建产物：`siyi-shares-website/dist/public/`
- ECS 网站目录：`/var/www/cn.segxm.com/web/`
- 本地静态备份仓库：`deployed-backup/`（可直接推送到 GitHub）

## 一次性准备

1. 复制配置模板：

   ```bash
   cp scripts/threeway-sync.env.example scripts/threeway-sync.env
   ```

2. 按需修改 `scripts/threeway-sync.env`（通常无需改 IP 和目录，只确认 `SSH_KEY_PATH`）。

3. 确认 SSH 私钥权限：

   ```bash
   chmod 600 ~/.ssh/china-seg.pem
   ```

4. 赋予脚本执行权限：

   ```bash
   chmod +x scripts/threeway-sync.sh
   ```

## 执行同步

在 `siyi-shares-website` 项目根目录执行：

```bash
./scripts/threeway-sync.sh
```

脚本流程：

1. 构建本地最新产物（`pnpm run build`）
2. 拉取服务器当前网站目录快照
3. 以本地构建为主生成合并目录
4. 将服务器上“本地暂缺”的文件补齐到合并目录（查缺补漏）
5. 用合并目录回写 `dist/public`
6. 同步到 `deployed-backup` 仓库
7. 部署到 ECS（rsync）
8. 对比本地与服务器 `index.html` 哈希做校验

## 推送 GitHub

脚本不会自动提交 git，建议人工审查后推送：

```bash
git -C /Users/zheng/Project-项目/肆意股份官网/siyi-shares-website status
git -C /Users/zheng/Project-项目/肆意股份官网/deployed-backup status
```

确认无误后在对应仓库分别 commit + push。
