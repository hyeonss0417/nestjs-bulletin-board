# 부모 이미지 지정
FROM node:12-slim
RUN yarn global add pm2
RUN npm i -g @nestjs/cli

# 작업 디렉토리 생성
WORKDIR /usr/src/app

# 빌드 필요한 파일 복사
COPY src src/
COPY ecosystem.config.js .
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY .env.* ./
COPY package*.json ./

# 의존성 라이브러리 설치
ENV NPM_CONFIG_LOGLEVEL error
RUN npm install

RUN npm run build

# 포트 매핑
EXPOSE 3000

# pm2 실행 
CMD [ "pm2-runtime", "start", "ecosystem.config.js"]