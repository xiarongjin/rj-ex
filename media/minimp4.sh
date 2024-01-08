filepath=$1
miniParam=$2
filename=$(echo "$filepath" | rev | cut -d'/' -f1 | rev)
name=$(echo "$filename" | cut -d'.' -f1)
path=$(echo "$filepath" | sed -r "s/(.+)\/.+/\1/")
outputfile="${path}/${name}_${miniParam}.mp4"
ffmpeg -i $filepath -b:v $miniParam -minrate $miniParam -maxrate $miniParam -bufsize $miniParam -r 24 $outputfile