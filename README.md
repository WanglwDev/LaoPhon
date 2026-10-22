# LaoPhon

离线老挝文转国际音标工具，支持音节拆分辅助、人工确认、IPA 生成和自定义语言点方案。

## 下载

请到 [Releases](https://github.com/WillWang0066/LaoPhon/releases) 下载适合自己电脑的 ZIP：

| 文件 | 适用电脑 |
| --- | --- |
| LaoPhon-Windows-x64.zip | Windows 10 / 11，Intel / AMD 64 位 |
| LaoPhon-macOS-arm64.zip | macOS 13 或更新，Apple M 系列 |
| LaoPhon-macOS-x64.zip | macOS 13 或更新，Intel |

Windows 请完整解压整个文件夹后打开 LaoPhon.exe，不要单独取出 EXE。Mac 解压后打开 LaoPhon.app。

## 功能

- 首次仅预置万象语言点，仍可新增、保存、切换和编辑自己的方案。
- 保留 15 个调类、辅音、元音和韵尾映射编辑。
- 支持离线拆分辅助、人工核对边界和本机校正词条。
- 老挝文字体为 Saysettha OT，IPA 字体为 IPAPANNEW。
- 全部文本在本地处理，无需账号或联网运行。

规则匹配不表示读音已核验，特殊拼写与歧义边界仍需人工确认。

## 验证与发布说明

Mac Apple 芯片版本已实际测试；Intel 包已通过 Rosetta 启动、切分和转换检查，尚未做 Intel 硬件实测。Windows 版已由 Wang Linwei 在 Windows 实机测试并确认能够正确使用。

Mac 使用 ad-hoc 签名，未做 Apple 开发者公证；Windows 未做商业代码签名。首次打开可能出现系统开发者身份提示。详细使用说明和 SHA-256 校验文件随 Release 一并提供。

此仓库用于分发安装包；运行时和字体的第三方许可说明保留在应用包内。

Developed by Wang Linwei | © 2026
