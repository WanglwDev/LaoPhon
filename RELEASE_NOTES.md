# LaoPhon v2.0.1

## English

- Add **中文 / English** to the upper-right header on Windows, Apple silicon Mac, and Intel Mac. The selection is remembered locally.
- Translate the workspace, tone profile editor, reference table, correction panel, validation messages, and native application menus.
- Preserve Lao input, IPA output, profile names, fonts, conversion rules, and local data when switching languages.
- Publish the source code, regression tests, portable build instructions, and an English-first bilingual README under the renamed account **WanglwDev**.

Vientiane is the only preset; users can still create other varieties. All three applications are named LaoPhon and retain the developer credit.

Verification: original 61 assertions, controller/profile checks, 153 language-switch assertions, and syllable/correction tests passed. Apple silicon GUI operations and language preference restoration were checked. The Intel package was checked through Rosetta. The earlier Windows release was confirmed on a Windows PC; this release's language switch has not yet been retested on Windows hardware. Mac applications are ad-hoc signed, not notarized; Windows is not commercially code-signed.

Download a platform ZIP to use the application. The separately attached source archive contains code and build documentation, without font binaries or the Electron runtime. `SHA256SUMS.txt` covers the four ZIPs and `USAGE.md`.

## 中文

- Windows、Apple 芯片 Mac、Intel Mac 页首右侧新增 **中文 / English**，并在本机记住选择。
- 主界面、声调方案编辑器、说明图表、校正面板、验证提示和原生菜单随界面语言切换。
- 切换语言时保留老挝文输入、IPA 结果、方案名称、字体、转换规则及本地数据。
- 在新账户 **WanglwDev** 下发布源码、回归测试、独立构建说明，以及英文在前、中文在后的 README。

初始仅预置万象，仍可自行新增其他语言点。三个应用均叫 LaoPhon，保留开发者署名。

验证：原有 61 项断言、界面与方案检查、153 项语言切换断言，以及音节和校正测试通过。已检查 Apple 芯片实际操作及重启恢复语言；Intel 包经 Rosetta 检查。此前 Windows 版本已在 Windows 电脑确认可用，本次新增切换尚未在 Windows 实机复测。Mac 仅做 ad-hoc 签名，未公证；Windows 未做商业代码签名。

使用软件请下载对应平台 ZIP。独立源码包包含代码和构建说明，不含字体二进制文件或 Electron 运行库。`SHA256SUMS.txt` 覆盖四个 ZIP 和 `USAGE.md`。

Developed by Wang Linwei | © 2026
