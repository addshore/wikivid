# WikVid

Get screenshots of the page till midnight (using local screenshots):

```sh
node main.js local 2021_storming_of_the_United_States_Capitol 2021-01-06T18:34:29Z 2021-01-07T00:00:01Z
```

Or using an API that is somewhere:

```sh
node main.js localhost:8125 2021_storming_of_the_United_States_Capitol 2021-01-06T18:34:29Z 2021-01-07T00:00:01Z
```

Fixed height video:

```sh
cat ./data/2021_storming_of_the_United_States_Capitol/*.png | ffmpeg -r 30 -s 1920x1080 -f image2pipe -vcodec png -pix_fmt yuv420p -i - output.mp4
```

**API**

You can run the API with something like:

```sh
PORT=8125 node api.js
```

**Heroku**

Run locally with:

```sh
heroku local web
```

Create an app:

```sh
heroku create
```

Push the app:

```sh
git push heroku main
```
