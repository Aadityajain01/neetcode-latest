class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private format(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.log(this.format('INFO', message, meta));
    }
  }

  error(message: string, error?: Error | any): void {
    const meta = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.format('ERROR', message, meta));
  }

  warn(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.warn(this.format('WARN', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.format('DEBUG', message, meta));
    }
  }
}

export const logger = new Logger();
