pipeline {
  agent any

  environment {
    APP_NAME = 'my-agent'
    APP_DIR  = '/var/www/my-agent'
    APP_PORT = '3301'
  }

  triggers { githubPush() }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm ci' }
    }
    stage('Build') {
      steps {
        sh 'cp "$APP_DIR/.env.local" .env.local'
        sh 'npm run build'
      }
    }
    stage('Deploy') {
      steps {
        sh '''
          rsync -a --delete --exclude '.git' --exclude '.env.local' --exclude 'uploads/' ./ "$APP_DIR/"
          cd "$APP_DIR"
          npm run db:setup
          PORT=$APP_PORT pm2 reload "$APP_NAME" --update-env || PORT=$APP_PORT pm2 start npm --name "$APP_NAME" -- start
          pm2 save
        '''
      }
    }
    stage('Health check') {
      steps { sh 'sleep 5 && curl -f http://127.0.0.1:$APP_PORT/login' }
    }
  }

  post {
    always { sh 'rm -f .env.local' }
  }
}
