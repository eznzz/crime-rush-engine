window.CrimeRushScenePresets={
  "schemaVersion": 1,
  "presets": [
    {
      "id": "garage",
      "title": "Гараж",
      "width": 864,
      "height": 486,
      "layers": [
        {
          "id": "background",
          "asset": "assets/webp/garage/failrun-garage-720p.webp",
          "x": 0,
          "y": 0,
          "width": 864,
          "height": 486,
          "z": 0
        }
      ],
      "actors": [
        {
          "id": "car",
          "kind": "vehicles",
          "sprite": "pobeditel",
          "view": "side",
          "x": 473,
          "y": 416,
          "height": 112,
          "z": 20,
          "shadow": true
        },
        {
          "id": "character",
          "kind": "characters",
          "sprite": "governor",
          "view": "man-side",
          "x": 218,
          "y": 418,
          "height": 166,
          "z": 21,
          "shadow": true
        }
      ],
      "atmosphere": "clear",
      "timeOfDay": "day"
    },
    {
      "id": "promenade",
      "title": "Набережная",
      "width": 864,
      "height": 432,
      "layers": [
        {
          "id": "background",
          "asset": "assets/webp/static/promenade-clear.webp",
          "x": 0,
          "y": 0,
          "width": 864,
          "height": 432,
          "z": 0
        },
        {
          "id": "city",
          "asset": "assets/webp/static/city.webp",
          "x": 0,
          "y": 0,
          "width": 864,
          "height": 432,
          "z": 2
        },
        {
          "id": "cloud-0",
          "asset": "assets/webp/static/cloud-02.webp",
          "x": 55,
          "y": 45,
          "width": 60,
          "height": 28,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "cloud-1",
          "asset": "assets/webp/static/cloud-05.webp",
          "x": 295,
          "y": 80,
          "width": 57,
          "height": 25,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "cloud-2",
          "asset": "assets/webp/static/cloud-02.webp",
          "x": 436,
          "y": 59,
          "width": 45,
          "height": 21,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "cloud-3",
          "asset": "assets/webp/static/cloud-04.webp",
          "x": 554,
          "y": 37,
          "width": 102,
          "height": 42,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "cloud-4",
          "asset": "assets/webp/static/cloud-05.webp",
          "x": 613,
          "y": 99,
          "width": 55,
          "height": 24,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "cloud-5",
          "asset": "assets/webp/static/cloud-02.webp",
          "x": 780,
          "y": 105,
          "width": 55,
          "height": 26,
          "z": 3,
          "motion": "drift"
        },
        {
          "id": "foreground",
          "asset": "assets/webp/static/monument-front.webp",
          "x": 0,
          "y": 0,
          "width": 864,
          "height": 432,
          "z": 10
        }
      ],
      "actors": [
        {
          "id": "car",
          "kind": "vehicles",
          "sprite": "pobeditel",
          "view": "side",
          "x": 473,
          "y": 362,
          "height": 112,
          "z": 20,
          "shadow": true
        },
        {
          "id": "character",
          "kind": "characters",
          "sprite": "governor",
          "view": "man-side",
          "x": 218,
          "y": 364,
          "height": 166,
          "z": 21,
          "shadow": true
        }
      ],
      "atmosphere": "clear",
      "timeOfDay": "day"
    }
  ]
};
