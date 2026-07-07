<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <p class="text-2xl font-bold">
                        Добре дошъл, {{ auth()->user()->name }}!
                    </p>
                    <p class="mt-2 text-gray-600">
                        Ти си с роля:
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                            {{ auth()->user()->role?->label ?? 'Няма роля' }}
                        </span>
                    </p>

                    <div class="mt-6">
                        @switch(auth()->user()->role?->name)
                            @case('owner')
                                <p class="text-sm text-gray-500">Имаш пълен достъп до системата.</p>
                                @break
                            @case('backend')
                                <p class="text-sm text-gray-500">Достъп до API и backend модули.</p>
                                @break
                            @case('frontend')
                                <p class="text-sm text-gray-500">Достъп до UI компоненти и frontend модули.</p>
                                @break
                            @case('pm')
                                <p class="text-sm text-gray-500">Достъп до управление на проекти и задачи.</p>
                                @break
                            @case('qa')
                                <p class="text-sm text-gray-500">Достъп до тестове и репорти.</p>
                                @break
                            @case('designer')
                                <p class="text-sm text-gray-500">Достъп до дизайн активи и макети.</p>
                                @break
                        @endswitch
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
