exports.up = function (knex) {
	return knex.raw(`
      CREATE OR REPLACE FUNCTION notify_data_change()
      RETURNS TRIGGER AS $$
  
      BEGIN
          -- Constructs payload as a JSON string containing the modified table row
          PERFORM pg_notify('data_changes', row_to_json(NEW)::text);
          RETURN NEW;
      END;
  
      $$ LANGUAGE plpgsql;
  
      CREATE OR REPLACE TRIGGER polls_data_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON polls
      FOR EACH ROW EXECUTE PROCEDURE notify_data_change();
    `)
}

exports.down = function (knex) {
	return knex.raw(`
      DROP TRIGGER IF EXISTS polls_data_change_trigger ON polls;
      DROP FUNCTION IF EXISTS notify_data_change;
    `)
}
