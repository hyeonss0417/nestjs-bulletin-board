module.exports = {
  apps: [
    {
      // Execution
      name: 'class101',
      script: 'dist/src/main.js', // pm2로 실행될 파일 경로
      watch: false, // 파일이 변경되면 자동으로 재실행 (true || false)

      // Cluster Mode
      exec_mode: 'cluster',
      instances: 'max', // CPU 코어 수 만큼 프로세스 생성

      // Zero Downtime Deployment
      wait_ready: true, // Ready 이벤트를 직접 발생시켜 New App 구동 전 Old App이 종료되는 일을 막음
      listen_timeout: 50000, // Ready 이벤트를 기다리는 시간 (ms)
      kill_timeout: 5000, // 클라이언트 요청 처리중 프로세스가 죽는 경우 방지

      // Environment
      env: {
        NODE_ENV: 'prod', // 배포환경시 적용될 설정
      },
      env_dev: {
        NODE_ENV: 'dev', // 배포환경시 적용될 설정
      },
    },
  ],
};
