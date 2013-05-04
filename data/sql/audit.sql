begin;

-- This is a mix of ideas taken from:
-- * http://wiki.postgresql.org/wiki/Audit_trigger
-- * http://wiki.postgresql.org/wiki/Audit_trigger_91plus

drop table if exists audit;
create table audit (
    audit_id serial primary key,
    table_name text not null,
    user_name text not null,
    action_timestamp timestamp not null default current_timestamp,
    action text not null check (action in ('i','d','u')),
    old_values hstore,
    new_values hstore,
    updated_cols text[],
    query text
);

create or replace function if_modified_func() returns trigger as $body$
begin
    if tg_op = 'UPDATE' then
        insert into audit (table_name, user_name, action, old_values, new_values, updated_cols, query)
        values (tg_table_name::text, current_user::text, 'u', hstore(old.*), hstore(new.*),
               akeys(hstore(new.*) - hstore(old.*)), current_query());
        return new;
    elsif tg_op = 'DELETE' then
        insert into audit (table_name, user_name, action, old_values, query)
        values (tg_table_name::text, current_user::text, 'd', hstore(old.*), current_query());
        return old;
    elsif tg_op = 'INSERT' then
        insert into audit (table_name, user_name, action, new_values, query)
        values (tg_table_name::text, current_user::text, 'i', hstore(new.*), current_query());
        return new;
    end if;
end;
$body$
language plpgsql;

do $$
declare
    t text;
    tables text[] = array['succursale_saq', 'representant', 'timbre_restaurateur', 'client', 'producteur',
                          'produit', 'client_produit', 'commande', 'commande_item', 'inventaire', 'backorder', 'usager'];
begin
    foreach t in array tables loop
        execute 'drop trigger if exists ' || t || '_audit on ' || t;
        execute 'create trigger ' || t || '_audit after insert or update or delete on ' || t || ' for each row execute procedure if_modified_func()';
    end loop;
end $$;

rollback;
--commit;
