module.exports = {
  apps: [
    {
      name: 'astroluna-server',
      script: 'npm',
      args: 'run server:dev',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'astroluna-client',
      script: 'npm',
      args: 'run client:dev',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        VITE_API_URL: 'http://localhost:5000'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}