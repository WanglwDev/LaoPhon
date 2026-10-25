# LaoPhon v2.0.2

## English

- Align the interface and usage guide with the terms **Initial consonant letters**, **Vowel letters**, and **Final consonant letters**.
- Synchronize the attached source archive and GitHub-generated source downloads with this revision.

- Add **中文 / English** to the upper-right header on Windows, Apple silicon Mac, and Intel Mac. The selection is remembered locally.
- Translate the workspace, tone profile editor, reference table, correction panel, validation messages, and native application menus.
- Preserve Lao input, IPA output, profile names, fonts, conversion rules, and local data when switching languages.
- Publish the source code, regression tests, portable build instructions, and an English-first bilingual README under the renamed account **WanglwDev**.

Vientiane is the only preset; users can still create other varieties. All three applications are named LaoPhon and retain the developer credit.

Verification: original 61 assertions, controller/profile checks, 153 language-switch assertions, and syllable/correction tests passed. Mac applications are ad-hoc signed; Windows is not commercially code-signed.

The current macOS test build has not yet been notarized by Apple. If you see a message that the developer cannot be verified when opening it for the first time, confirm that the package came from this page, then go to **System Settings → Privacy & Security → Open Anyway**.

Download a platform ZIP to use the application. The separately attached source archive contains code and build documentation, without font binaries or the Electron runtime. `SHA256SUMS.txt` covers the four ZIPs and `USAGE.md`.

## 中文

- 界面和使用说明统一采用“起始辅音字母”“元音字母”“尾辅音字母”。
- 独立源码包及 GitHub 自动生成的源码下载同步到本次修订。

- Windows、Apple 芯片 Mac、Intel Mac 页首右侧新增 **中文 / English**，并在本机记住选择。
- 主界面、声调方案编辑器、说明图表、校正面板、验证提示和原生菜单随界面语言切换。
- 切换语言时保留老挝文输入、IPA 结果、方案名称、字体、转换规则及本地数据。
- 在新账户 **WanglwDev** 下发布源码、回归测试、独立构建说明，以及英文在前、中文在后的 README。

初始仅预置万象，仍可自行新增其他语言点。三个应用均叫 LaoPhon，保留开发者署名。

验证：原有 61 项断言、界面与方案检查、153 项语言切换断言，以及音节和校正测试通过。Mac 仅做 ad-hoc 签名；Windows 未做商业代码签名。

macOS当前测试版尚未通过 Apple 公证。首次打开若提示无法验证开发者，确认安装包来自本页面后，可进入 **系统设置 → 隐私与安全性 → 仍要打开**。

使用软件请下载对应平台 ZIP。独立源码包包含代码和构建说明，不含字体二进制文件或 Electron 运行库。`SHA256SUMS.txt` 覆盖四个 ZIP 和 `USAGE.md`。

Developed by Wang Linwei | © 2026
