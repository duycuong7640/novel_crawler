import { Injectable } from '@nestjs/common';
import { v1 as uuid } from 'uuid';
import snowflake from 'snowflake-id';
import { SETTINGS } from '../../constants/settings';

@Injectable()
export class GeneratorService {
  private snowflakeId: snowflake = ((_machineId = 1) => {
    return new snowflake({
      mid: _machineId,
      offset: (2021 - 1970) * 31536000 * 1000,
    });
  })();

  public generateSnowflakeId(): string {
    return this.snowflakeId.generate();
  }

  public generateRandomToken(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let token = '';
    for (let i = 0; i < length; i++) {
      token += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return token;
  }

  public uuid(): string {
    return uuid();
  }

  public convertViewCrawler(viewsString: string) {
    let view = 0;
    if (viewsString.includes('K')) {
      const viewsNumber = parseFloat(viewsString.replace(/[^\d.]/g, ''));
      view = Math.round(viewsNumber * 1000);
    } else {
      view = parseInt(viewsString.replace(/[^\d]/g, ''));
    }
    return view;
  }

  public fileName(ext: string): string {
    return this.uuid() + '.' + ext;
  }

  public otpGeneral() {
    const token = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const now = new Date();
    const timestamp = now.getTime();
    const expireAt = new Date(timestamp + SETTINGS.OTPExpiresIn * 60 * 1000);

    return {
      otp: token,
      expireAt: expireAt,
    };
  }
}
