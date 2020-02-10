local msg = redis.call('rpop','messages')
if (msg == nil or msg == false) then
  return nil
end

local id, type, value = string.match(msg,'([^;]+);([^;]+);(.+)')
if (id == nil or type == nil or value == nil) then
  return {nil, msg}
end

redis.call('lpush', id .. ':' .. type, value)
return {id, type, value}