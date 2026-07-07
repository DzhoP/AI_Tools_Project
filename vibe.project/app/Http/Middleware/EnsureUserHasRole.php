<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_if(! $user, 401, 'Неавторизиран достъп.');
        abort_unless(
            collect($roles)->contains($user->role?->name),
            403,
            'Нямаш права за тази операция.'
        );

        return $next($request);
    }
}
