#!/bin/sh

filepath=$1
res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,bit_rate -of csv=s=x:p=0 $filepath)
o_width=$(echo "$res" | cut -d'x' -f1)
o_height=$(echo "$res" | cut -d'x' -f2)
echo "width: $o_width; height: $o_height"
