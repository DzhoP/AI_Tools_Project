<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = ['name', 'slug', 'color'];

    public function aiTools(): BelongsToMany
    {
        return $this->belongsToMany(AiTool::class, 'ai_tool_tag');
    }
}
