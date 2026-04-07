import shutil
import os
from datetime import datetime
import logging

logger = logging.getLogger("backup_manager")

class BackupManager:
    def __init__(self, db_path="backend_app.db", backup_dir="backups"):
        self.db_path = db_path
        self.backup_dir = backup_dir
        os.makedirs(self.backup_dir, exist_ok=True)

    def create_backup(self, label="auto"):
        if not os.path.exists(self.db_path):
            logger.warning(f"Backup failed: {self.db_path} does not exist.")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{label}_{timestamp}.db"
        backup_path = os.path.join(self.backup_dir, backup_filename)

        try:
            shutil.copy2(self.db_path, backup_path)
            logger.info(f"Database backup created: {backup_path}")
            
            # Keep only the last 3 backups to save space
            self._cleanup_old_backups()
            return backup_path
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            return None

    def _cleanup_old_backups(self, limit=3):
        try:
            backups = [os.path.join(self.backup_dir, f) for f in os.listdir(self.backup_dir) if f.endswith('.db')]
            backups.sort(key=os.path.getmtime, reverse=True)
            
            for old_backup in backups[limit:]:
                os.remove(old_backup)
                logger.info(f"Removed old backup: {old_backup}")
        except Exception as e:
            logger.error(f"Error cleaning up backups: {e}")

backup_mgr = BackupManager()
