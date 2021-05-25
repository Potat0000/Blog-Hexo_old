#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import shutil
import re

os.chdir(os.path.join("public", "archives"))
dirs = [x[0] for x in os.walk('.') if re.match(r'^\./[0-9]{8}/[^\\]+$', x[0])]
for dir in dirs:
    out = list(os.walk(dir))[0]
    for d in out[1]:
        shutil.rmtree(os.path.join(dir, d))
    for f in [x for x in out[2] if x != 'index.html']:
        os.remove(os.path.join(dir, f))
