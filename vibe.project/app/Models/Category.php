<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'color'];

    public function aiTools(): BelongsToMany
    {
        return $this->belongsToMany(AiTool::class, 'ai_tool_category');
    }
}
