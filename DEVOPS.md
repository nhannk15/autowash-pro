# AutoWash Pro DevOps Runbook

Runbook nay uu tien nhung viec co rui ro cao nhat cua project: backup DB, test restore, chuan hoa `.env`, rollback deploy, health check va monitor.

## 1. Chuan hoa `.env`

1. Tao `.env` tu mau:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Dien secret that vao `.env`. Khong commit `.env`.

3. Kiem tra `.env`:

   ```powershell
   .\ops\validate-env.ps1
   ```

Luu y quan trong: `MYSQL_DATABASE` phai trung voi database trong `SPRING_DATASOURCE_URL`. Moi truong production nen dung `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` hoac `none`; `update` chi nen dung local/demo.

## 2. Backup database

Chay backup truoc moi lan deploy, rollback, restore, hoac thao tac migration:

```powershell
.\ops\backup-db.ps1
```

Tren EC2/Linux:

```sh
./ops/backup-db.sh
```

File backup nam trong `backups/` va duoc ignore khoi Git. Script dung `mariadb-dump --single-transaction --routines --triggers` de backup on dinh hon khi app dang chay.

Mac dinh script giu backup toi da 14 ngay va toi da 20 file moi nhat. Co the doi khi chay:

```powershell
.\ops\backup-db.ps1 -RetentionDays 7 -MaxBackupFiles 10
```

Tren EC2/Linux:

```sh
RETENTION_DAYS=7 MAX_BACKUP_FILES=10 ./ops/backup-db.sh
```

## 3. Test restore

Khong coi backup la dung cho den khi da restore thu:

```powershell
.\ops\test-restore-db.ps1 -BackupFile .\backups\autowash-autowashpro-YYYYMMDD-HHMMSS.sql
```

Tren EC2/Linux:

```sh
./ops/test-restore-db.sh ./backups/autowash-autowashpro-YYYYMMDD-HHMMSS.sql
```

Script import vao database tam `autowash_restore_test`, dem table, roi xoa database test. Buoc nay khong ghi de database production.

## 4. Restore that

Chi restore that khi da test restore thanh cong:

```powershell
.\ops\restore-db.ps1 -BackupFile .\backups\autowash-autowashpro-YYYYMMDD-HHMMSS.sql
```

Script se yeu cau go `RESTORE`, dung backend/frontend, drop va tao lai database dich, import backup, sau do start lai service.

## 5. Deploy an toan

Truoc deploy:

```powershell
.\ops\validate-env.ps1
.\ops\backup-db.ps1
```

Deploy bang Compose:

```powershell
docker compose pull
docker compose up -d --remove-orphans
.\ops\health-check.ps1 -BaseUrl https://autowashpro.io.vn -BackendUrl http://localhost:8080
```

## 6. Rollback deploy

Moi image trong ECR duoc tag theo commit SHA. Khi can rollback, chon tag backend/frontend da biet tot:

```powershell
.\ops\rollback-deploy.ps1 -BackendTag <good-commit-sha> -FrontendTag <good-commit-sha>
```

Tren EC2/Linux:

```sh
./ops/rollback-deploy.sh <good-commit-sha> <good-commit-sha>
```

Script tu backup DB truoc rollback, sua tag image trong `docker-compose.yml`, pull image, restart service va chay health check. Neu da backup rieng roi:

```powershell
.\ops\rollback-deploy.ps1 -BackendTag <good-commit-sha> -FrontendTag <good-commit-sha> -SkipBackup
```

## 7. Health check va monitor

Kiem tra mot lan:

```powershell
.\ops\health-check.ps1 -BaseUrl https://autowashpro.io.vn -BackendUrl http://localhost:8080
```

Tren EC2/Linux:

```sh
BASE_URL=https://autowashpro.io.vn BACKEND_URL=http://localhost:8080 ./ops/health-check.sh
```

Monitor lap lai moi 60 giay:

```powershell
.\ops\monitor-health.ps1 -BaseUrl https://autowashpro.io.vn -BackendUrl http://localhost:8080 -IntervalSeconds 60
```

Log mac dinh: `logs/health-monitor.log`.

## 8. Checklist su co nhanh

- App loi sau deploy: chay `docker compose ps`, `docker compose logs backend --tail 200`, roi rollback image tag gan nhat da tot.
- DB nghi loi: chay backup hien trang truoc, sau do test restore backup gan nhat.
- Health backend fail: kiem tra `/actuator/health`, bien datasource, container `autowash-db`.
- Frontend fail nhung backend UP: kiem tra Nginx config, SSL cert, va `docker compose logs frontend --tail 200`.
