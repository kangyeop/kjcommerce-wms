module.exports = {
  apps: [
    {
      name: 'kjcommerce-server',
      cwd: './packages/server',
      script: 'dist/main.js',
      instances: 1, // CPU 코어 수에 맞춰 조절 (0: 모든 코어 사용)
      exec_mode: 'cluster', // 'cluster' or 'fork'
      autorestart: true,
      watch: false, // 프로덕션에서는 false 권장
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        DB_SYNCHRONIZE: 'true', // 개발 환경에서 자동 동기화
      },
      env_production: {
        NODE_ENV: 'production',
        DB_SYNCHRONIZE: 'true', // 수동 배포 시에도 자동 동기화 활성화 (사용자 요청)
      },
      error_file: '../../logs/server-error.log',
      out_file: '../../logs/server-out.log',
      time: true,
      merge_logs: true,
    },
  ],
};
