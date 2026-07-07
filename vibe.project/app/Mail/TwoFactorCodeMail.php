<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $code) {}

    public function build(): self
    {
        return $this
            ->subject('Твой код за вход — AI_Tools')
            ->html("<p>Твоят код за вход е:</p><h2>{$this->code}</h2><p>Валиден е 10 минути.</p>");
    }
}
