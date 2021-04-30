FROM node:10.15.0 as builder 

# create app directory in container 
 

RUN mkdir -p /app  
 
 
# set /app directory as default working directory 
WORKDIR /app 
# only copy package.json initially so that `RUN yarn` layer is recreated only 
# if there are changes in package.json 
ADD package.json /app/ 
# --pure-lockfile: Don’t generate a yarn.lock lockfile 
RUN npm install 
#--pure-lockfile 
COPY . /app/ 
RUN npm run build 
 
FROM nginx:1.11.12-alpine 
# RUN rm /etc/nginx/conf.d/default.conf 
ADD nginx/conf.d/ /etc/nginx/conf.d/ 
COPY --from=builder /app/build /home/automation
EXPOSE 8001
