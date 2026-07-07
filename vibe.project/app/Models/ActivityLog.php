<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'ai_tool_id', 'action', 'tool_name'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(?User $user, AiTool $tool, string $action): void
    {
        static::create([
            'user_id'    => $user?->id,
            'ai_tool_id' => $tool->id,
            'action'     => $action,
            'tool_name'  => $tool->name,
        ]);
    }
}
