#!/bin/bash

cd backend
npm install
npm run dev &
cd ..
npm run dev
