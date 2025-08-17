

export const IS_ADMIN_KEY = 'isAdmin';
export function IsAdmin(): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(IS_ADMIN_KEY, true, target);
    };
}