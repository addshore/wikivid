# WikVid

Fixed height video:

```sh
cat ./data/2021_storming_of_the_United_States_Capitol/*.png | ffmpeg -r 30 -s 1920x1080 -f image2pipe -vcodec png -pix_fmt yuv420p -i - output.mp4
```