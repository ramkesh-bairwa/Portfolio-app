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
    // Unknown email must get 401: proves the app is up and MySQL answers
    stage('Health check') {
      steps {
        sh '''
          for i in 1 2 3 4 5 6 7 8 9 10; do
            code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" \
              -d '{"email":"check@example.invalid","password":"x"}' http://127.0.0.1:$APP_PORT/api/auth/login)
            echo "Try $i: $code"
            [ "$code" = "401" ] && exit 0
            sleep 3
          done
          echo "Health check failed. See: pm2 logs $APP_NAME --err --lines 50"
          exit 1
        '''
      }
    }
  }

  post {
    always { sh 'rm -f .env.local' }
  }
}
