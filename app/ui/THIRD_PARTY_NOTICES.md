# Third-party notices

LaoPhon 2.0 syllable patterns are adapted from LaoNLP `laonlp/tokenize/syllable.py`, copyright 2020–2026 Wannaphong Phatthiyaphaibun, licensed under Apache License 2.0.

Source: https://github.com/wannaphong/LaoNLP/blob/master/laonlp/tokenize/syllable.py
Retrieved: 2026-10-21
Source SHA-256: 4dd68ba646d5578c8cb38ada08eaf027b5881392de0d863dad0c168597a9c19d

The JavaScript adaptation replaces regex findall with bounded whole-run dynamic programming, preserves unmatched text and offsets, reports alternative paths, applies validated user corrections and checks IPA support before transcription. Original strings are preserved; Unicode and tone-order normalization are used only for matching/conversion.

This is a spelling-rule aid, not a validated universal pronunciation model. Rule coverage, unit tests and corpus accuracy are distinct. No general accuracy percentage is claimed.

The source refers to Phissamay et al., “Syllabification of Lao Script for Line Breaking”. LaoPhon does not claim to have independently reproduced that paper's evaluation.

Full license: LICENSE-LaoNLP.txt
