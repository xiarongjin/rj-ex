#!/bin/sh

round() {
  echo $(printf %.$2f $(echo "scale=$2;(((10^$2)*$1)+0.5)/(10^$2)" | bc))
}

getTrans() {
  if [ $1 == 90 ]; then
    trans=1
  elif [ $1 == -90 ]; then
    trans=2
  elif [ $1 == 180 ]; then
    trans=3
  fi
  echo $trans
}

filepath=$1
res=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 $filepath)
# echo $o_scale
o_width=$(echo "$res" | cut -d'x' -f1)
o_height=$(echo "$res" | cut -d'x' -f2)


# 修复非方形像素带来的误差
res1=$(ffprobe -v error -select_streams v:0 -show_entries stream=sample_aspect_ratio -of default=noprint_wrappers=1:nokey=1 $filepath)
scale_w=$(echo "$res1" | cut -d':' -f1)
scale_h=$(echo "$res1" | cut -d':' -f2)
if [[ $scale_w != 'N/A' && $scale_h != 'N/A' ]]; then 
  scale=$(echo "scale=4; $scale_w / $scale_h" | bc)
else
  scale=1
fi

if [ $scale != 'N/A' ]; then
  o_width=$(echo "scale=0; $o_width * $scale" | bc)
  o_width=${o_width%.*}
fi

filename=$(echo "$filepath" | rev | cut -d'/' -f1 | rev)
name=$(echo "$filename" | cut -d'.' -f1)
path=$(echo "$filepath" | sed -r "s/(.+)\/.+/\1/")

# 查看是否旋转
res2=$(echo $(ffprobe -v error -select_streams v:0 -show_entries side_data=rotation -of default=nw=1:nk=1 $filepath))
trans=0
if [[ $res2 != '' ]]; then
  # filepath=$(echo $(rotate $res2 $filepath))
  # echo $filepath
  trans=$(echo $(getTrans $res2))
  tmp=$o_width
  o_width=$o_height
  o_height=$tmp
fi

shift 1
fmt="flv"
crf=25
fps=25
width=0
height=0
width_align=0
height_align=0
width_tail=0
height_tail=0

while [ -n "$1" ]; do
  case $1 in
  -w)
    width=$2
    shift 2
    ;;
  -h)
    height=$2
    shift 2
    ;;
  -crf)
    crf=$2
    shift 2
    ;;
  -fmt)
    fmt=$2
    shift 2
    ;;
  -fps)
    fps=$2
    shift 2
    ;;
  *)
    break
    ;;
  esac
done

convert(){
  if [ $height == 0 ]; then
    if [ $width == 0 ]; then
      width=$o_width
    fi
    if [ $fmt == 'flv' ]; then
      width=$(echo "$(round $(echo "(${width}+15)/16" | bc) 0)*16" | bc)
    fi
    height=$(round $(echo "scale=4; ${width}/${o_width}*${o_height}" | bc) 0)
    height_align=$height
    height_tail=0
    width_align=$width
    width_tail=0

    if [ $fmt == 'flv' ]; then
      height_align=$(echo "${height}-${height}%16" | bc)
      height_tail=$(echo "${height}%16" | bc)
    fi
  fi

  if [ $width == 0 ]; then
    if [ $fmt == 'flv' ]; then
      height=$(echo "$(round $(echo "(${height}+15)/16" | bc) 0)*16" | bc)
    fi
    width=$(round $(echo "scale=4; ${height}/${o_height}*${o_width}" | bc) 0)
    width_align=$width
    width_tail=0
    height_align=$height
    height_tail=0
    if [ $fmt == 'flv' ]; then
      width_align=$(echo "${width}-${width}%16" | bc)
      width_tail=$(echo "${width}%16" | bc)
    fi
  fi

  # echo $width
  # echo $width_align
  # echo $width_tail
  # echo $height
  # echo $height_align
  # echo $height_tail

  if [[ $((height % 2)) != 0 && $height -ne $height_align ]]; then
    let height=height-1
  fi

  if [ $fmt == "flv" ]; then
    outputfile="${path}/${name}_${width_align}.flv"
  else
    outputfile="${path}/${name}_${width}.mp4"
  fi

  outputposter="${path}/${name}_${width_align}_poster.jpg"

  ffmpeg -y -i $filepath -c:v libx264 -r $fps -profile:v baseline -pix_fmt yuv420p -preset slow -crf ${crf} -an -filter:v fps=24 -vf scale=${width}:${height},crop=${width_align}:${height_align}:0:0 $outputfile

  let imgWidth=width*2
  let imgWidthAlign=width_align*2
  let imgWidthTail=width_tail*2
  let imgHeight=height*2
  let imgHeightAlign=height_align*2
  let imgHeightTail=height_tail*2
  echo $width $height $width_align $height_align $width_tail $height_tail
  ffmpeg -y -i $filepath -ss 00:00:00 -vf scale=${imgWidth}:${imgHeight},crop=${imgWidthAlign}:${imgHeightAlign}:0:0 -frames:v 1 $outputposter
}

widths=(${width//,/ })
for var in ${widths[@]}
do
  width=$var
  height=0
  convert
done
