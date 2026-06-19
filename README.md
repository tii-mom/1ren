# R1 Growth Terminal (1人算力增长终端)

1人算力有限公司推出的基于 AI 算力与 R1 平台权益资产的终端交互系统。

## 📖 项目简介

R1 Growth Terminal 是一款集“模拟设备并网”、“AI 算力额度管理”、“平台权益锁仓”和“用户公司影子发行”于一体的模拟客户端。我们旨在通过该终端，为用户提供便捷的算力调用入口以及透明的平台资产模型演示。

> [!WARNING]
> 本终端当前版本为 **V1 模拟环境**，所有的算力设备并网、API 额度产出、R1 代扣质押、用户影子 Token 筹集等功能均采用本地数据模拟演示，不涉及任何真实加密货币资产与现实募资行为。

## 🛠️ 快速启动

### 准备条件
*   Node.js (v18+)
*   npm (v9+)

### 安装与运行
1.  **安装依赖**：
    ```bash
    npm install
    ```
2.  **配置环境**（可选）：
    ```bash
    cp .env.example .env
    ```
3.  **本地开发**：
    ```bash
    npm run dev
    ```
4.  **项目构建**：
    ```bash
    npm run build
    ```
5.  **代码分析**：
    ```bash
    npm run lint
    ```

## 📂 项目文档

为了明确平台模型并规范资产定义，请参考以下五大核心文档：

1.  **产品手册**：[docs/PRODUCT_V1.md](file:///Users/yudeyou/Desktop/1ren/docs/PRODUCT_V1.md)
    *   1人算力有限公司的商业定位与核心架构说明。
2.  **资产模型**：[docs/ASSET_MODEL.md](file:///Users/yudeyou/Desktop/1ren/docs/ASSET_MODEL.md)
    *   区分 AI Token (算力额度) 与 R1 (平台权益 token) 的定位与运转体系。
3.  **R1 平台机制**：[docs/R1_MECHANISM.md](file:///Users/yudeyou/Desktop/1ren/docs/R1_MECHANISM.md)
    *   R1 的锁仓质押、影子发行挂牌、手续费折扣等核心权益规则。
4.  **用户新手路线**：[docs/USER_ONBOARDING_PATH.md](file:///Users/yudeyou/Desktop/1ren/docs/USER_ONBOARDING_PATH.md)
    *   从注册体验、设备部署、到成立 1 人算力公司并发行代币的完整成长路径。
5.  **风险披露声明**：[docs/RISK_DISCLOSURE.md](file:///Users/yudeyou/Desktop/1ren/docs/RISK_DISCLOSURE.md)
    *   免责条款、资产波动风险说明，以及对平台性质的明确披露。
