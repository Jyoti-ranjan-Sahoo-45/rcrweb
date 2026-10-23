import paramiko

HOST = "217.21.84.194"
PORT = 65002
USER = "u529002218"
PASS = "Jyoti45@jrs"
DB_NAME = "u529002218_Rcrpayment1"
DB_USER = "u529002218_Rcrpayment1"
DB_PASS = "Rcrpayment1@1234"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(100) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `template_id` VARCHAR(50) NOT NULL,
  `template_title` VARCHAR(255) NOT NULL,
  `order_amount` DECIMAL(10,2) NOT NULL,
  `order_currency` VARCHAR(10) DEFAULT 'INR',
  `payment_session_id` VARCHAR(255) NULL,
  `cf_payment_id` VARCHAR(100) NULL,
  `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED') DEFAULT 'PENDING',
  `payment_method` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

def setup_db():
    print("Connecting to SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=15)
    print("SSH Connected.")

    # Run mysql command via stdin
    stdin, stdout, stderr = ssh.exec_command(f'mysql -u {DB_USER} -p\'{DB_PASS}\' {DB_NAME}')
    alter_sql = """
    ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `loan_app_id` VARCHAR(50) NULL AFTER `template_title`;
    ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `return_app_url` VARCHAR(255) NULL AFTER `loan_app_id`;
    """
    stdin.write(CREATE_TABLE_SQL + "\n" + alter_sql + "\nDESCRIBE `orders`;\n")
    stdin.channel.shutdown_write()
    
    out = stdout.read().decode()
    err = stderr.read().decode()
    print("STDOUT:\n", out)
    if err:
        print("STDERR:\n", err)
    
    ssh.close()

if __name__ == "__main__":
    setup_db()
