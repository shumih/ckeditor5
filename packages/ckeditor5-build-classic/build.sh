#!/usr/bin/env bash
npm run build:dev && cp ./build/ckeditor.{js.map,js} ~/projects/vtb-kka/kka-admin/src/app
