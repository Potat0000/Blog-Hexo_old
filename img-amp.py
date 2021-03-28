#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import shutil

os.chdir(os.path.join(".", "source", "_posts"))
dirs = [x[0] for x in os.walk('.')]
dirs.remove('.')
for i in dirs:
    shutil.copytree(i, os.path.join(i, "amp"))
    
