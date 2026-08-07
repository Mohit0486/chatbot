import { Body, Controller, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('twilio/voice')
  async incomingTwilioVoice(
    @Body() body: Record<string, string>,
    @Query('workspaceId') workspaceId: string,
    @Query('voiceAgentId') voiceAgentId: string,
    @Res() res: Response,
  ) {
    const twiml = await this.integrationsService.handleIncomingTwilioVoice({
      ...body,
      workspaceId,
      voiceAgentId,
    });
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml);
  }

  @Post('deepgram/transcript')
  deepgramTranscript(
    @Body()
    payload: {
      workspaceId: string;
      conversationId: string;
      transcript: string;
      durationSec?: number;
    },
  ) {
    return this.integrationsService.handleDeepgramTranscript(payload);
  }
}
