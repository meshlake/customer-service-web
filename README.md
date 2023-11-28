# 电商智能客服演示前端

> 本项目为电商智能客服演示项目的前端

- 测试环境：[https://customer-service-test.meshlake.com/](https://customer-service-test.meshlake.com/)，账户 `admin`，密码 `admin@2023`
- 正式环境：暂未上线

## 环境要求

- [Node.js](https://nodejs.org/en/) (>=16.14.0)
- [pnpm](https://pnpm.io/) (>=6.14.0)

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务
npm start

# 编译打包
npm run build
```

## 部署

### 测试环境部署

- 镜像打包，代码变更提交至 test 分支，github action 自动打包镜像

- k8s 更新镜像，重启服务
```bash
kubectl replace --force -f deploy/test.yaml
```

### 正式环境部署

- 镜像打包，git 标签提交至 github ，github action 自动打包对应版本的镜像

- k8s 更新镜像，重启服务
```bash
kubectl replace --force -f deploy/work.yaml
```
