# 最小数据库结构设计 V1 (Database Schema V1)

本设计定义了 1人算力公司 (1ren) 后端系统的最小数据库关系表结构模型，推荐选用 PostgreSQL 等主流关系型数据库进行物理设计与部署。

---

## 1. 用户基本信息表 (users)
用于保存用户的身份、层级关联和节点注册信息。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | 是 (PK) | 用户全局唯一 ID，如 `usr-xxxx` | 主键索引 |
| `tg_id` | `BIGINT` | 否 | Telegram 唯一的 User ID，用于静默鉴权识别 | 唯一索引 (`uniq_users_tg_id`) |
| `invite_code` | `VARCHAR(16)` | 是 | 用户自身的邀请码，如 `CUBE654` | 唯一索引 (`uniq_invite_code`) |
| `referrer_id` | `VARCHAR(64)` | 否 | 上级推荐人（用户）的 ID | 外键/普通索引 (`idx_users_ref_id`) |
| `wallet_address` | `VARCHAR(64)` | 否 | 备用绑定的外部冷/热钱包地址 | 普通索引 |
| `created_at` | `TIMESTAMP` | 是 | 注册创世时间，默认 `CURRENT_TIMESTAMP` | - |

---

## 2. 身份会话表 (sessions)
用于存储和校验用户的 API 访问鉴权令牌。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `token` | `VARCHAR(128)` | 是 (PK) | 会话认证 Bearer 令牌，如 `s_tok_xxxx` | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 该会话所属的用户 ID | 外键/普通索引 (`idx_sess_user_id`) |
| `ip_address` | `VARCHAR(45)` | 否 | 用户连接时的 IP 地址 | - |
| `expires_at` | `TIMESTAMP` | 是 | 会话过期时间点 | 普通索引 |
| `created_at` | `TIMESTAMP` | 是 | 登录时间 | - |

---

## 3. 资产账户余额表 (asset_accounts)
用于缓存和高效查询用户的各项代币余额，可作为动账流水的快速汇总。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | 是 (PK) | 账户自增主键 | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 用户 ID | 唯一联合索引 (`user_id`, `asset_type`) |
| `asset_type` | `VARCHAR(20)` | 是 | 资产类型：`usdt`, `r1`, `ai_token`, `crystals`, `coolant` | 联合索引一部分 |
| `balance` | `DECIMAL(24, 8)` | 是 | 资产账户可用余额，默认 `0.00` | - |
| `updated_at` | `TIMESTAMP` | 是 | 最后动账更新时间 | - |

---

## 4. 动账流水明细表 (ledger_entries)
记录用户所有的收支明细流水，为对账与资产追踪的唯一可信流水账。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | 是 (PK) | 流水唯一 ID，如 `led-xxxx` | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 用户 ID | 普通索引 (`idx_ledg_user_id`) |
| `asset_type` | `VARCHAR(20)` | 是 | 动账资产类型：`usdt`, `r1`, `ai_token`, `crystals`, `coolant` | 普通索引 |
| `amount` | `DECIMAL(24, 8)` | 是 | 动账发生额（正数为增加，负数为减少） | - |
| `action` | `VARCHAR(32)` | 是 | 动账类型：`lease_device`, `buy_r1`, `sell_ai`, `reset`, `reward_ad` | - |
| `description` | `TEXT` | 是 | 动账发生业务详细文案描述 | - |
| `created_at` | `TIMESTAMP` | 是 | 发生时间 | 普通索引 (`idx_ledg_created`) |

---

## 5. 矿机硬件配置模板表 (devices)
作为矿机模版，定义用户能够购买/租赁的矿机配置属性。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `template_id` | `VARCHAR(32)` | 是 (PK) | 模板唯一 ID，如 `gpu-rtx4090` | 主键索引 |
| `name` | `VARCHAR(64)` | 是 | 设备名称，如 `RTX 4090 算力部署` | - |
| `cost_usdt` | `DECIMAL(12, 2)` | 是 | 租赁购买所需要消费的模拟 USDT 数额 | - |
| `contract_days` | `INT` | 是 | 合约有效天数（`7` 表示体验，`9999` 表示永续） | - |
| `daily_yield` | `DECIMAL(8, 4)` | 是 | 算力产出倍率，例如 `0.0120` | - |
| `is_active` | `BOOLEAN` | 是 | 模板是否上架中 | - |

---

## 6. 设备部署订单表 (device_orders)
记录用户购买（租赁）设备的合约单。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | 是 (PK) | 订单 ID，如 `ord-xxxx` | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 购买用户 ID | 普通索引 (`idx_ord_user_id`) |
| `template_id` | `VARCHAR(32)` | 是 | 设备模板 ID | - |
| `cost_paid` | `DECIMAL(12, 2)` | 是 | 实际支付的模拟 USDT 额度 | - |
| `purchased_at` | `TIMESTAMP` | 是 | 购买时间点 | - |
| `expires_at` | `TIMESTAMP` | 是 | 到期时间点 | - |
| `status` | `VARCHAR(20)` | 是 | 设备状态：`running`, `decayed` (降频需液氮), `expired` | 普通索引 (`idx_ord_status`) |
| `efficiency` | `DECIMAL(4, 2)` | 是 | 当前效率倍率，默认 `1.0` | - |
| `accumulated_rewards` | `DECIMAL(16, 4)` | 是 | 该设备已累计产出的 AI Token 总量 | - |

---

## 7. AI Token 产出记录表 (mining_records)
记录每日或每周期设备并网后，产出 AI Token 利润的详细结算记录。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | 是 (PK) | 产出流水唯一自增 ID | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 用户 ID | 联合索引 (`user_id`, `created_at`) |
| `device_order_id` | `VARCHAR(64)` | 否 | 产出该笔收益的设备订单 ID (若为团队加成可为空) | 普通索引 |
| `amount` | `DECIMAL(16, 6)` | 是 | 产出的 AI Token 数量 | - |
| `type` | `VARCHAR(20)` | 是 | 产出类型：`mining` (设备产出), `resonance` (团队节点加成) | - |
| `description` | `VARCHAR(256)` | 是 | 产出描述 | - |
| `created_at` | `TIMESTAMP` | 是 | 收益计算及入账结算时间 | 联合索引一部分 |

---

## 8. R1 权益交易订单表 (r1_orders)
记录 R1/USDT 快速现货撮合/兑换交易历史。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | 是 (PK) | 交易委托单 ID | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 发起用户 ID | 普通索引 |
| `order_type` | `VARCHAR(10)` | 是 | 方向：`buy` (买入 R1), `sell` (卖出 R1) | - |
| `r1_amount` | `DECIMAL(18, 4)` | 是 | 交易成交的 R1 数量 | - |
| `price_usdt` | `DECIMAL(12, 6)` | 是 | 成交时的 R1 单价价格 | - |
| `total_usdt` | `DECIMAL(18, 4)` | 是 | 成交的模拟 USDT 总金额 | - |
| `created_at` | `TIMESTAMP` | 是 | 交易时间 | 普通索引 |

---

## 9. 公司 Token 发行主表 (company_tokens)
记录用户发行的公司影子代币的资质、发行价与状态。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(64)` | 是 (PK) | 公司 Token 发行 ID，如 `tok-xxxx` | 主键索引 |
| `user_id` | `VARCHAR(64)` | 是 | 发起发行人（用户）的 ID | 普通索引 |
| `name` | `VARCHAR(64)` | 是 | 公司影子代币全称 | - |
| `symbol` | `VARCHAR(16)` | 是 | 代币符号，如 `QSOL` | 唯一索引 (`uniq_ctok_symbol`) |
| `total_supply` | `BIGINT` | 是 | 总发行量 (Supply) | - |
| `initial_price` | `DECIMAL(10, 4)` | 是 | 初始模拟定价 (USDT) | - |
| `target_pool` | `DECIMAL(12, 2)` | 是 | 模拟支持池目标上限 (USDT) | - |
| `raised_usdt` | `DECIMAL(12, 2)` | 是 | 当前已筹得的模拟 USDT 金额 | - |
| `locked_r1` | `DECIMAL(12, 2)` | 是 | 质押锁定的 R1 权益代币数量，当前固定 `100` | - |
| `status` | `VARCHAR(20)` | 是 | 发行状态：`launching` (募资中), `listed` (已上市挂牌) | 普通索引 |
| `owner_level` | `VARCHAR(32)` | 是 | 发行时发行人的节点等级 | - |
| `created_at` | `TIMESTAMP` | 是 | 发行申请时间 | - |

---

## 10. 公司 Token 模拟支持明细表 (company_token_supports)
记录用户使用模拟 USDT 认购注入影子代币支持池的记录流水。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | 是 (PK) | 支持记录自增 ID | 主键索引 |
| `token_id` | `VARCHAR(64)` | 是 | 支持的目标公司 Token ID | 普通索引 (`idx_sup_token_id`) |
| `user_id` | `VARCHAR(64)` | 是 | 出资支持的用户 ID | 普通索引 (`idx_sup_user_id`) |
| `usdt_amount` | `DECIMAL(12, 2)` | 是 | 支持注入的模拟 USDT 数额 | - |
| `created_at` | `TIMESTAMP` | 是 | 出资注入时间 | - |

---

## 11. 邀请裂变归因网络表 (referrals)
定义用户节点之间的推荐链路网，用以提供深度级联团队加成算力判定。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | 是 (PK) | 关系条目主键 | 主键索引 |
| `referrer_id` | `VARCHAR(64)` | 是 | 邀请人（上级）ID | 联合索引 (`referrer_id`, `invitee_id`) |
| `invitee_id` | `VARCHAR(64)` | 是 | 被邀请人（下级）ID | 唯一索引 (`uniq_ref_invitee`) |
| `depth` | `INT` | 是 | 层级深度差（系统限制最大深度结算等级） | - |
| `created_at` | `TIMESTAMP` | 是 | 绑定时间点 | - |

---

## 12. 系统与安全日志审计表 (system_events)
用于监控及审计关键业务异常或调试动作，提供防作弊与操作审计支撑。

| 字段名 | 字段类型 | 是否必须 | 作用描述 | 索引建议 |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `BIGSERIAL` | 是 (PK) | 审计自增 ID | 主键索引 |
| `user_id` | `VARCHAR(64)` | 否 | 触发操作的用户 ID | 普通索引 |
| `event_type` | `VARCHAR(32)` | 是 | 事件类型：`sys_reset`, `dev_override`, `auth_failed`, `exploit_suspect` | 普通索引 |
| `payload` | `TEXT` | 否 | 审计详细上下文数据，可存储 JSON 字符串 | - |
| `created_at` | `TIMESTAMP` | 是 | 记录审计发生时间点 | - |
