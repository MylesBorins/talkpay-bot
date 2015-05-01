FROM node
copy . .
RUN npm install
RUN touch forever.log && touch out.log && touch err.log
CMD npm start && tail -f /out.log