pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    triggers {
        // Build automatically on GitHub push (needs the GitHub webhook) with polling as a fallback
        githubPush()
        pollSCM('H/5 * * * *')
    }

    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy and restart the app after checkout')
    }

    environment {
        APP_NAME    = 'my-agent'
        DOMAIN      = 'my-agent.glamofashion.com'
        DEPLOY_HOST = '187.126.117.103'
        APP_DIR     = '/var/www/my-agent'         // live app dir on DEPLOY_HOST (pm2 runs from here)
        BUILD_DIR   = '/var/www/my-agent_build'   // new build is made here, then copied to APP_DIR
        APP_PORT    = '3301'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty=format:"%h - %an: %s"'
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    anyOf { branch 'main'; expression { env.BRANCH_NAME == null } }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'gsm-school-ssh',
                                                  usernameVariable: 'SSH_USER',
                                                  passwordVariable: 'SSHPASS'),
                                 file(credentialsId: 'my-agent-env', variable: 'ENV_FILE')]) {
                    // sshpass -e reads the password from $SSHPASS, so it never shows up in logs or `ps`
                    sh '''
                        set -e
                        SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30"
                        REMOTE="$SSH_USER@$DEPLOY_HOST"

                        sshpass -e ssh $SSH_OPTS "$REMOTE" "mkdir -p '$APP_DIR/uploads' '$BUILD_DIR'"

                        # Sync the source into the build dir. The live app keeps running untouched.
                        sshpass -e rsync -az --delete \
                            -e "ssh $SSH_OPTS" \
                            --exclude '.git/' \
                            --exclude 'node_modules/' \
                            --exclude '.next/' \
                            --exclude '.env.local' \
                            --exclude 'uploads/' \
                            ./ "$REMOTE:$BUILD_DIR/"

                        sshpass -e scp $SSH_OPTS "$ENV_FILE" "$REMOTE:$APP_DIR/.env.local"

                        sshpass -e ssh $SSH_OPTS "$REMOTE" bash -se <<EOF
                            set -e
                            chmod 600 "$APP_DIR/.env.local"

                            # Build while the old version keeps serving
                            cd "$BUILD_DIR"
                            cp "$APP_DIR/.env.local" .env.local
                            npm ci
                            npm run build
                            rm -f .env.local

                            # Swap in the new build. Uploads and the server's .env.local are never overwritten or deleted.
                            rsync -a --delete \
                                --exclude '.env.local' \
                                --exclude 'uploads/' \
                                "$BUILD_DIR/" "$APP_DIR/"

                            cd "$APP_DIR"
                            npm run db:setup   # safe to re-run: only adds missing tables/columns
                            if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
                                PORT=$APP_PORT pm2 reload "$APP_NAME" --update-env
                            else
                                PORT=$APP_PORT pm2 start npm --name "$APP_NAME" -- start
                            fi
                            pm2 save

                            # First deploy only: Nginx site for the subdomain, then a Let's Encrypt certificate
                            if [ ! -f /etc/nginx/sites-available/$APP_NAME ]; then
                                sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__PORT__/$APP_PORT/g" \
                                    deploy/nginx/my-agent.conf > /etc/nginx/sites-available/$APP_NAME
                                ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
                                nginx -t
                                systemctl reload nginx
                            fi
                            if [ ! -d /etc/letsencrypt/live/$DOMAIN ]; then
                                certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
                                    --register-unsafely-without-email --redirect
                            fi
EOF
                    '''
                }
            }
        }

        stage('Health Check') {
            when {
                allOf {
                    expression { params.DEPLOY }
                    anyOf { branch 'main'; expression { env.BRANCH_NAME == null } }
                }
            }
            steps {
                // Unknown email must get 401: proves the app is up and MySQL answers
                sh '''
                    for i in $(seq 1 12); do
                        code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
                            -H "Content-Type: application/json" \
                            -d '{"email":"check@example.invalid","password":"x"}' \
                            "https://$DOMAIN/api/auth/login")
                        if [ "$code" = "401" ]; then
                            echo "https://$DOMAIN is up and the database answers"
                            exit 0
                        fi
                        echo "Waiting for app... ($i/12, HTTP $code)"
                        sleep 5
                    done
                    echo "https://$DOMAIN did not pass the health check. See: pm2 logs $APP_NAME --err --lines 50"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} deployed to https://${env.DOMAIN}"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed — the previous version keeps running unless the build got past the rsync into APP_DIR."
        }
    }
}
