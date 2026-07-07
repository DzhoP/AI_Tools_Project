<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolExample extends Model
{
    protected $fillable = ['ai_tool_id', 'title', 'url', 'image_url', 'description', 'sort_order'];

    public function aiTool(): BelongsTo
    {
        return $this->belongsTo(AiTool::class);
    }
}
