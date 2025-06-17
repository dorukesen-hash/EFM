'use client';

export default function RegisterPage() {


    async function handleSubmit(e) {
        e.preventDefault();
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
            <h1 className="text-2xl">Register</h1>
        </form>
    );
}